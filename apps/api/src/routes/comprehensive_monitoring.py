"""
Comprehensive Monitoring API Routes
Enhanced monitoring and alerting endpoints
"""
from flask import Blueprint, request, jsonify, current_app
from flask_socketio import emit, join_room, leave_room
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging

from src.models.auth import require_auth, optional_auth, get_current_user
from src.services.monitoring_service import get_monitoring_service, AlertSeverity, AlertStatus, IncidentStatus
from src.models.monitoring_models import (
    SystemAlert, Incident, HealthCheck, SLAMetric, LogEntry, 
    SyntheticCheck, SyntheticResult, AlertRule
)

logger = logging.getLogger(__name__)
comprehensive_monitoring_bp = Blueprint('comprehensive_monitoring', __name__)

# Health and Status Endpoints

@comprehensive_monitoring_bp.route('/health/dashboard', methods=['GET'])
def get_monitoring_dashboard():
    """Get comprehensive monitoring dashboard data"""
    try:
        monitoring_service = get_monitoring_service()
        
        # System health
        health_status = monitoring_service.get_health_status()
        
        # Recent metrics
        from src.models.monitoring_models import MonitoringMetric
        recent_metrics = MonitoringMetric.query.filter(
            MonitoringMetric.timestamp >= datetime.utcnow() - timedelta(hours=1)
        ).order_by(MonitoringMetric.timestamp.desc()).limit(100).all()
        
        # Active alerts
        active_alerts = monitoring_service.get_active_alerts()
        
        # System statistics
        total_requests = MonitoringMetric.query.filter(
            MonitoringMetric.metric_name == 'http_requests_total',
            MonitoringMetric.timestamp >= datetime.utcnow() - timedelta(hours=1)
        ).count()
        
        error_metrics = MonitoringMetric.query.filter(
            MonitoringMetric.metric_name == 'http_requests_total',
            MonitoringMetric.metadata.contains({'status_code': {'$gte': 400}})
        ).count()
        
        error_rate = (error_metrics / max(total_requests, 1)) * 100
        
        # Average response time
        response_time_metrics = MonitoringMetric.query.filter(
            MonitoringMetric.metric_name == 'http_request_duration',
            MonitoringMetric.timestamp >= datetime.utcnow() - timedelta(hours=1)
        ).all()
        
        avg_response_time = 0
        if response_time_metrics:
            avg_response_time = sum(m.value for m in response_time_metrics) / len(response_time_metrics)
        
        # P95 response time
        response_times = sorted([m.value for m in response_time_metrics])
        p95_index = int(len(response_times) * 0.95) if response_times else 0
        p95_response_time = response_times[p95_index] if response_times else 0
        
        # Infrastructure metrics
        infrastructure = monitoring_service.infrastructure_metrics
        
        # Recent incidents
        recent_incidents = Incident.query.filter(
            Incident.created_at >= datetime.utcnow() - timedelta(days=7)
        ).order_by(Incident.created_at.desc()).limit(10).all()
        
        dashboard_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'health': health_status,
            'stats': {
                'total_requests': total_requests,
                'error_rate': round(error_rate, 2),
                'avg_response_time': round(avg_response_time, 2),
                'p95_response_time': round(p95_response_time, 2),
                'active_alerts': len(active_alerts),
                'active_incidents': len([i for i in recent_incidents if i.status in ['open', 'acknowledged', 'investigating']])
            },
            'infrastructure': infrastructure,
            'alerts': active_alerts[:20],  # Latest 20 alerts
            'incidents': [incident.to_dict() for incident in recent_incidents],
            'metrics': [metric.to_dict() for metric in recent_metrics[:50]]  # Latest 50 metrics
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f"Error getting monitoring dashboard: {str(e)}")
        return jsonify({'error': 'Failed to get dashboard data'}), 500

@comprehensive_monitoring_bp.route('/health/system', methods=['GET'])
def get_system_health():
    """Get detailed system health information"""
    try:
        monitoring_service = get_monitoring_service()
        health_status = monitoring_service.get_health_status()
        
        # Get recent health checks
        recent_checks = HealthCheck.query.filter(
            HealthCheck.timestamp >= datetime.utcnow() - timedelta(minutes=10)
        ).order_by(HealthCheck.timestamp.desc()).all()
        
        # Group by service
        service_checks = {}
        for check in recent_checks:
            if check.service_name not in service_checks:
                service_checks[check.service_name] = []
            service_checks[check.service_name].append(check.to_dict())
        
        return jsonify({
            'health': health_status,
            'recent_checks': service_checks,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting system health: {str(e)}")
        return jsonify({'error': 'Failed to get system health'}), 500

# Alert Management Endpoints

@comprehensive_monitoring_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get alerts with filtering and pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        severity = request.args.get('severity')
        status = request.args.get('status')
        source = request.args.get('source')
        
        query = SystemAlert.query
        
        if severity:
            query = query.filter_by(severity=severity)
        if status:
            query = query.filter_by(status=status)
        if source:
            query = query.filter_by(source=source)
        
        # Pagination
        alerts = query.order_by(SystemAlert.created_at.desc())\
                     .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'alerts': [alert.to_dict() for alert in alerts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': alerts.total,
                'pages': alerts.pages
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        return jsonify({'error': 'Failed to get alerts'}), 500

@comprehensive_monitoring_bp.route('/alerts/<alert_id>/acknowledge', methods=['POST'])
@require_auth
def acknowledge_alert(alert_id):
    """Acknowledge an alert"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        monitoring_service = get_monitoring_service()
        success = monitoring_service.acknowledge_alert(alert_id, user.id)
        
        if success:
            return jsonify({'message': 'Alert acknowledged successfully'}), 200
        else:
            return jsonify({'error': 'Alert not found'}), 404
        
    except Exception as e:
        logger.error(f"Error acknowledging alert {alert_id}: {str(e)}")
        return jsonify({'error': 'Failed to acknowledge alert'}), 500

@comprehensive_monitoring_bp.route('/alerts/<alert_id>/resolve', methods=['POST'])
@require_auth
def resolve_alert(alert_id):
    """Resolve an alert"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        monitoring_service = get_monitoring_service()
        success = monitoring_service.resolve_alert(alert_id, user.id)
        
        if success:
            return jsonify({'message': 'Alert resolved successfully'}), 200
        else:
            return jsonify({'error': 'Alert not found'}), 404
        
    except Exception as e:
        logger.error(f"Error resolving alert {alert_id}: {str(e)}")
        return jsonify({'error': 'Failed to resolve alert'}), 500

@comprehensive_monitoring_bp.route('/alerts/rules', methods=['GET'])
def get_alert_rules():
    """Get alert rules"""
    try:
        rules = AlertRule.query.all()
        return jsonify({
            'rules': [rule.to_dict() for rule in rules],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting alert rules: {str(e)}")
        return jsonify({'error': 'Failed to get alert rules'}), 500

@comprehensive_monitoring_bp.route('/alerts/rules', methods=['POST'])
@require_auth
def create_alert_rule():
    """Create a new alert rule"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'metric_name', 'condition', 'threshold', 'severity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        monitoring_service = get_monitoring_service()
        rule_id = monitoring_service.create_alert_rule(
            name=data['name'],
            metric_name=data['metric_name'],
            condition=data['condition'],
            threshold=data['threshold'],
            severity=AlertSeverity(data['severity']),
            duration=data.get('duration', 300),
            notification_channels=data.get('notification_channels', []),
            created_by=user.id
        )
        
        if rule_id:
            return jsonify({'message': 'Alert rule created successfully', 'id': rule_id}), 201
        else:
            return jsonify({'error': 'Failed to create alert rule'}), 500
        
    except Exception as e:
        logger.error(f"Error creating alert rule: {str(e)}")
        return jsonify({'error': 'Failed to create alert rule'}), 500

# Incident Management Endpoints

@comprehensive_monitoring_bp.route('/incidents', methods=['GET'])
def get_incidents():
    """Get incidents with filtering"""
    try:
        status = request.args.get('status')
        severity = request.args.get('severity')
        limit = int(request.args.get('limit', 100))
        
        query = Incident.query
        
        if status:
            query = query.filter_by(status=status)
        if severity:
            query = query.filter_by(severity=severity)
        
        incidents = query.order_by(Incident.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'incidents': [incident.to_dict() for incident in incidents],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting incidents: {str(e)}")
        return jsonify({'error': 'Failed to get incidents'}), 500

@comprehensive_monitoring_bp.route('/incidents', methods=['POST'])
@require_auth
def create_incident():
    """Create a new incident"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'severity', 'priority']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        monitoring_service = get_monitoring_service()
        incident_id = monitoring_service.create_incident(
            title=data['title'],
            description=data['description'],
            severity=AlertSeverity(data['severity']),
            priority=data['priority'],
            created_by=user.id,
            affected_services=data.get('affected_services', []),
            related_alerts=data.get('related_alerts', [])
        )
        
        if incident_id:
            return jsonify({'message': 'Incident created successfully', 'id': incident_id}), 201
        else:
            return jsonify({'error': 'Failed to create incident'}), 500
        
    except Exception as e:
        logger.error(f"Error creating incident: {str(e)}")
        return jsonify({'error': 'Failed to create incident'}), 500

@comprehensive_monitoring_bp.route('/incidents/<incident_id>/status', methods=['PUT'])
@require_auth
def update_incident_status(incident_id):
    """Update incident status"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'Missing required field: status'}), 400
        
        monitoring_service = get_monitoring_service()
        success = monitoring_service.update_incident_status(
            incident_id=incident_id,
            status=IncidentStatus(data['status']),
            updated_by=user.id,
            description=data.get('description')
        )
        
        if success:
            return jsonify({'message': 'Incident status updated successfully'}), 200
        else:
            return jsonify({'error': 'Incident not found'}), 404
        
    except Exception as e:
        logger.error(f"Error updating incident {incident_id}: {str(e)}")
        return jsonify({'error': 'Failed to update incident'}), 500

# Synthetic Monitoring Endpoints

@comprehensive_monitoring_bp.route('/synthetic/checks', methods=['GET'])
def get_synthetic_checks():
    """Get synthetic monitoring checks"""
    try:
        checks = SyntheticCheck.query.all()
        return jsonify({
            'checks': [check.to_dict() for check in checks],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting synthetic checks: {str(e)}")
        return jsonify({'error': 'Failed to get synthetic checks'}), 500

@comprehensive_monitoring_bp.route('/synthetic/checks', methods=['POST'])
@require_auth
def create_synthetic_check():
    """Create a new synthetic check"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'url', 'check_type', 'frequency']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        monitoring_service = get_monitoring_service()
        check_id = monitoring_service.create_synthetic_check(
            name=data['name'],
            url=data['url'],
            check_type=data['check_type'],
            frequency=data['frequency'],
            expected_status=data.get('expected_status'),
            expected_content=data.get('expected_content'),
            headers=data.get('headers'),
            authentication=data.get('authentication'),
            created_by=user.id
        )
        
        if check_id:
            return jsonify({'message': 'Synthetic check created successfully', 'id': check_id}), 201
        else:
            return jsonify({'error': 'Failed to create synthetic check'}), 500
        
    except Exception as e:
        logger.error(f"Error creating synthetic check: {str(e)}")
        return jsonify({'error': 'Failed to create synthetic check'}), 500

@comprehensive_monitoring_bp.route('/synthetic/checks/<check_id>/run', methods=['POST'])
@require_auth
def run_synthetic_check(check_id):
    """Run a synthetic check manually"""
    try:
        monitoring_service = get_monitoring_service()
        result = monitoring_service.run_synthetic_check(check_id)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error running synthetic check {check_id}: {str(e)}")
        return jsonify({'error': 'Failed to run synthetic check'}), 500

@comprehensive_monitoring_bp.route('/synthetic/results', methods=['GET'])
def get_synthetic_results():
    """Get synthetic monitoring results"""
    try:
        check_id = request.args.get('check_id')
        limit = int(request.args.get('limit', 100))
        
        query = SyntheticResult.query
        
        if check_id:
            query = query.filter_by(check_id=check_id)
        
        results = query.order_by(SyntheticResult.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'results': [result.to_dict() for result in results],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting synthetic results: {str(e)}")
        return jsonify({'error': 'Failed to get synthetic results'}), 500

# Metrics and Logs Endpoints

@comprehensive_monitoring_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """Get metrics with filtering and time range"""
    try:
        metric_name = request.args.get('metric_name')
        source = request.args.get('source')
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')
        limit = int(request.args.get('limit', 1000))
        
        query = MonitoringMetric.query
        
        if metric_name:
            query = query.filter_by(metric_name=metric_name)
        if source:
            query = query.filter_by(source=source)
        
        # Time range filtering
        if start_time:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            query = query.filter(MonitoringMetric.timestamp >= start_dt)
        if end_time:
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            query = query.filter(MonitoringMetric.timestamp <= end_dt)
        
        metrics = query.order_by(MonitoringMetric.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'metrics': [metric.to_dict() for metric in metrics],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        return jsonify({'error': 'Failed to get metrics'}), 500

@comprehensive_monitoring_bp.route('/logs', methods=['GET'])
def get_logs():
    """Get log entries with filtering"""
    try:
        level = request.args.get('level')
        source = request.args.get('source')
        service = request.args.get('service')
        limit = int(request.args.get('limit', 100))
        
        monitoring_service = get_monitoring_service()
        logs = monitoring_service.get_logs(
            level=level,
            source=source,
            service=service,
            limit=limit
        )
        
        return jsonify({
            'logs': logs,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting logs: {str(e)}")
        return jsonify({'error': 'Failed to get logs'}), 500

@comprehensive_monitoring_bp.route('/logs', methods=['POST'])
def log_entry():
    """Create a log entry"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['level', 'source', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        monitoring_service = get_monitoring_service()
        monitoring_service.log_entry(
            level=data['level'],
            source=data['source'],
            message=data['message'],
            service=data.get('service'),
            user_id=data.get('user_id'),
            request_id=data.get('request_id'),
            session_id=data.get('session_id'),
            stack_trace=data.get('stack_trace'),
            metadata=data.get('metadata', {})
        )
        
        return jsonify({'message': 'Log entry created successfully'}), 201
        
    except Exception as e:
        logger.error(f"Error creating log entry: {str(e)}")
        return jsonify({'error': 'Failed to create log entry'}), 500

# SLA Monitoring Endpoints

@comprehensive_monitoring_bp.route('/sla/metrics', methods=['GET'])
def get_sla_metrics():
    """Get SLA metrics"""
    try:
        service_name = request.args.get('service_name')
        metric_type = request.args.get('metric_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = SLAMetric.query
        
        if service_name:
            query = query.filter_by(service_name=service_name)
        if metric_type:
            query = query.filter_by(metric_type=metric_type)
        
        # Date range filtering
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(SLAMetric.period_start >= start_dt)
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(SLAMetric.period_end <= end_dt)
        
        sla_metrics = query.order_by(SLAMetric.period_start.desc()).all()
        
        return jsonify({
            'sla_metrics': [metric.to_dict() for metric in sla_metrics],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting SLA metrics: {str(e)}")
        return jsonify({'error': 'Failed to get SLA metrics'}), 500

# Health Check Endpoints

@comprehensive_monitoring_bp.route('/health/checks', methods=['GET'])
def get_health_checks():
    """Get health check results"""
    try:
        service_name = request.args.get('service_name')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 100))
        
        query = HealthCheck.query
        
        if service_name:
            query = query.filter_by(service_name=service_name)
        if status:
            query = query.filter_by(status=status)
        
        health_checks = query.order_by(HealthCheck.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'health_checks': [check.to_dict() for check in health_checks],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting health checks: {str(e)}")
        return jsonify({'error': 'Failed to get health checks'}), 500

# WebSocket handlers for real-time updates

def setup_monitoring_websocket_handlers(socketio):
    """Setup WebSocket handlers for real-time monitoring updates"""
    
    @socketio.on('subscribe_monitoring')
    def handle_subscribe_monitoring(data):
        """Subscribe to monitoring updates"""
        monitoring_type = data.get('type', 'all')  # alerts, incidents, metrics, all
        room_name = f"monitoring_{monitoring_type}"
        
        join_room(room_name)
        
        emit('subscription_confirmed', {
            'type': monitoring_type,
            'room': room_name,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        logger.info(f"Client subscribed to monitoring: {monitoring_type}")
    
    @socketio.on('unsubscribe_monitoring')
    def handle_unsubscribe_monitoring(data):
        """Unsubscribe from monitoring updates"""
        monitoring_type = data.get('type', 'all')
        room_name = f"monitoring_{monitoring_type}"
        
        leave_room(room_name)
        
        emit('unsubscription_confirmed', {
            'type': monitoring_type,
            'room': room_name,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        logger.info(f"Client unsubscribed from monitoring: {monitoring_type}")
    
    return socketio

# Add alert callback for real-time notifications
def setup_alert_notifications():
    """Setup alert notifications via WebSocket"""
    monitoring_service = get_monitoring_service()
    
    def alert_callback(alert):
        """Callback function for new alerts"""
        try:
            # This would need access to socketio instance
            # In practice, this would be handled by the Flask-SocketIO setup
            logger.info(f"New alert created: {alert.title}")
            
            # Broadcast to monitoring room
            # socketio.emit('new_alert', alert.to_dict(), room='monitoring_alerts')
            
        except Exception as e:
            logger.error(f"Failed to notify about alert: {str(e)}")
    
    monitoring_service.add_alert_callback(alert_callback)