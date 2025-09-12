"""
Monitoring API Routes
Health checks, metrics, and observability endpoints
"""
from flask import Blueprint, request, jsonify
from src.models.auth import require_auth, optional_auth, get_current_user
from src.models.safety_limits import safety_manager
from src.models.observability import observability_manager
from src.models.endpoint_manager import HuggingFaceEndpointManager
import logging

logger = logging.getLogger(__name__)

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    try:
        health_data = observability_manager.get_system_health()
        status_code = 200 if health_data["status"] == "healthy" else 503
        return jsonify(health_data), status_code
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "message": f"Health check failed: {str(e)}"
        }), 503

@monitoring_bp.route('/health/detailed', methods=['GET'])
@require_auth
def detailed_health_check():
    """Detailed health check with all components"""
    try:
        # Register health checks for various components
        def check_database():
            try:
                from src.models.user import db
                # Simple query to check database connectivity
                db.session.execute('SELECT 1')
                return {"status": "healthy", "message": "Database connection OK"}
            except Exception as e:
                return {"status": "unhealthy", "message": f"Database error: {str(e)}"}
        
        def check_endpoints():
            try:
                endpoint_manager = HuggingFaceEndpointManager()
                status = endpoint_manager.get_all_status()
                healthy_endpoints = sum(1 for s in status.values() if s.status == "Running")
                total_endpoints = len(status)
                
                if healthy_endpoints == 0:
                    return {"status": "degraded", "message": "No endpoints running"}
                elif healthy_endpoints < total_endpoints:
                    return {"status": "degraded", "message": f"{healthy_endpoints}/{total_endpoints} endpoints running"}
                else:
                    return {"status": "healthy", "message": "All endpoints healthy"}
            except Exception as e:
                return {"status": "unhealthy", "message": f"Endpoint check failed: {str(e)}"}
        
        # Register and run health checks
        observability_manager.register_health_check("database", check_database)()
        observability_manager.register_health_check("endpoints", check_endpoints)()
        
        health_data = observability_manager.get_system_health()
        status_code = 200 if health_data["status"] == "healthy" else 503
        
        return jsonify(health_data), status_code
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "message": f"Health check failed: {str(e)}"
        }), 503

@monitoring_bp.route('/metrics', methods=['GET'])
@require_auth
def get_metrics():
    """Get system metrics"""
    try:
        metric_name = request.args.get('name')
        limit = int(request.args.get('limit', 100))
        
        metrics = observability_manager.get_metrics(metric_name, limit)
        return jsonify(metrics), 200
        
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        return jsonify({'error': 'Failed to get metrics'}), 500

@monitoring_bp.route('/logs/requests', methods=['GET'])
@require_auth
def get_request_logs():
    """Get request logs"""
    try:
        limit = int(request.args.get('limit', 100))
        logs = observability_manager.get_request_logs(limit)
        return jsonify(logs), 200
        
    except Exception as e:
        logger.error(f"Error getting request logs: {str(e)}")
        return jsonify({'error': 'Failed to get request logs'}), 500

@monitoring_bp.route('/logs/errors', methods=['GET'])
@require_auth
def get_error_logs():
    """Get error logs"""
    try:
        limit = int(request.args.get('limit', 100))
        logs = observability_manager.get_error_logs(limit)
        return jsonify(logs), 200
        
    except Exception as e:
        logger.error(f"Error getting error logs: {str(e)}")
        return jsonify({'error': 'Failed to get error logs'}), 500

@monitoring_bp.route('/logs/performance', methods=['GET'])
@require_auth
def get_performance_logs():
    """Get performance logs"""
    try:
        limit = int(request.args.get('limit', 100))
        logs = observability_manager.get_performance_logs(limit)
        return jsonify(logs), 200
        
    except Exception as e:
        logger.error(f"Error getting performance logs: {str(e)}")
        return jsonify({'error': 'Failed to get performance logs'}), 500

@monitoring_bp.route('/dashboard', methods=['GET'])
@require_auth
def get_dashboard_data():
    """Get comprehensive dashboard data"""
    try:
        dashboard_data = observability_manager.get_dashboard_data()
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f"Error getting dashboard data: {str(e)}")
        return jsonify({'error': 'Failed to get dashboard data'}), 500

@monitoring_bp.route('/limits/user', methods=['GET'])
@require_auth
def get_user_limits():
    """Get current user's rate limits and usage"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        stats = safety_manager.get_user_stats(user.id)
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error getting user limits: {str(e)}")
        return jsonify({'error': 'Failed to get user limits'}), 500

@monitoring_bp.route('/limits/user/<int:user_id>', methods=['GET'])
@require_auth
def get_specific_user_limits(user_id):
    """Get specific user's rate limits and usage (admin only)"""
    try:
        # TODO: Add admin role check
        stats = safety_manager.get_user_stats(user_id)
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error getting user limits for {user_id}: {str(e)}")
        return jsonify({'error': 'Failed to get user limits'}), 500

@monitoring_bp.route('/limits/system', methods=['GET'])
@require_auth
def get_system_limits():
    """Get system-wide rate limiting statistics"""
    try:
        # TODO: Add admin role check
        stats = safety_manager.get_system_stats()
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error getting system limits: {str(e)}")
        return jsonify({'error': 'Failed to get system limits'}), 500

@monitoring_bp.route('/safety/check', methods=['POST'])
@require_auth
def check_content_safety():
    """Check content for safety violations"""
    try:
        data = request.get_json()
        if not data or 'content' not in data:
            return jsonify({'error': 'Content is required'}), 400
        
        content = data['content']
        is_safe, message = safety_manager.check_content_safety(content)
        
        return jsonify({
            'is_safe': is_safe,
            'message': message
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking content safety: {str(e)}")
        return jsonify({'error': 'Failed to check content safety'}), 500

@monitoring_bp.route('/alerts', methods=['GET'])
@require_auth
def get_alerts():
    """Get system alerts and warnings"""
    try:
        # TODO: Implement alert system
        alerts = []
        
        # Check for high error rates
        dashboard_data = observability_manager.get_dashboard_data()
        error_rate = dashboard_data["stats"]["error_rate"]
        
        if error_rate > 10:  # More than 10% error rate
            alerts.append({
                "level": "warning",
                "message": f"High error rate: {error_rate}%",
                "timestamp": dashboard_data["timestamp"]
            })
        
        # Check system health
        health = dashboard_data["health"]
        if health["status"] != "healthy":
            alerts.append({
                "level": "error" if health["status"] == "unhealthy" else "warning",
                "message": f"System status: {health['status']}",
                "timestamp": health["timestamp"]
            })
        
        return jsonify(alerts), 200
        
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        return jsonify({'error': 'Failed to get alerts'}), 500

# Middleware to log all requests
@monitoring_bp.before_app_request
def log_request():
    """Log incoming requests"""
    if request.endpoint and request.endpoint.startswith('monitoring.'):
        start_time = request.environ.get('REQUEST_START_TIME')
        if start_time:
            duration_ms = (time.time() - start_time) * 1000
            user = get_current_user()
            user_id = user.id if user else None
            
            observability_manager.log_request(
                method=request.method,
                path=request.path,
                status_code=200,  # Will be updated in after_request
                duration_ms=duration_ms,
                user_id=user_id
            )

@monitoring_bp.after_app_request
def after_request(response):
    """Update request log with response status"""
    # This would need to be implemented at the app level
    return response

