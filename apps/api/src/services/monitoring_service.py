"""
Comprehensive Monitoring Service
Business logic for monitoring, alerting, and observability
"""
import asyncio
import logging
import time
import uuid
import psutil
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import asdict
from flask import Flask
import json

from src.models.monitoring_models import (
    MonitoringMetric, SystemAlert, Incident, HealthCheck, SLAMetric,
    LogEntry, SyntheticCheck, SyntheticResult, AlertRule,
    Alert, AlertSeverity, AlertStatus, IncidentStatus
)

logger = logging.getLogger(__name__)

class MonitoringService:
    """Comprehensive monitoring and alerting service"""
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.alert_callbacks: List[Callable] = []
        self.infrastructure_metrics = {}
        self.monitoring_enabled = True
        
    def initialize(self, app: Flask):
        """Initialize monitoring service with Flask app"""
        self.app = app
        
        # Start background monitoring tasks
        self._start_background_tasks()
        
        logger.info("Monitoring service initialized")
    
    def _start_background_tasks(self):
        """Start background monitoring tasks"""
        if not self.app:
            return
            
        with self.app.app_context():
            # Schedule infrastructure monitoring
            self.app.scheduler.add_job(
                func=self.collect_infrastructure_metrics,
                trigger="interval",
                seconds=30,
                id="infrastructure_monitoring"
            )
            
            # Schedule health checks
            self.app.scheduler.add_job(
                func=self.run_health_checks,
                trigger="interval",
                seconds=60,
                id="health_checks"
            )
            
            # Schedule SLA calculations
            self.app.scheduler.add_job(
                func=self.calculate_sla_metrics,
                trigger="interval",
                seconds=300,  # 5 minutes
                id="sla_calculations"
            )
            
            # Schedule synthetic monitoring
            self.app.scheduler.add_job(
                func=self.run_synthetic_checks,
                trigger="interval",
                seconds=300,
                id="synthetic_monitoring"
            )
            
            # Schedule alert evaluation
            self.app.scheduler.add_job(
                func=self.evaluate_alert_rules,
                trigger="interval",
                seconds=60,
                id="alert_evaluation"
            )
    
    # Infrastructure Monitoring
    def collect_infrastructure_metrics(self):
        """Collect system infrastructure metrics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            self.store_metric(
                'system.cpu.usage',
                'gauge',
                cpu_percent,
                {'host': 'local', 'core': 'total'}
            )
            
            # Memory usage
            memory = psutil.virtual_memory()
            self.store_metric(
                'system.memory.usage',
                'gauge',
                memory.percent,
                {'host': 'local', 'type': 'virtual'}
            )
            
            self.store_metric(
                'system.memory.available',
                'gauge',
                memory.available,
                {'host': 'local', 'type': 'virtual'}
            )
            
            # Disk usage
            disk = psutil.disk_usage('/')
            self.store_metric(
                'system.disk.usage',
                'gauge',
                (disk.used / disk.total) * 100,
                {'host': 'local', 'mount': '/'}
            )
            
            self.store_metric(
                'system.disk.free',
                'gauge',
                disk.free,
                {'host': 'local', 'mount': '/'}
            )
            
            # Network I/O
            network = psutil.net_io_counters()
            self.store_metric(
                'system.network.bytes_sent',
                'counter',
                network.bytes_sent,
                {'host': 'local', 'interface': 'total'}
            )
            
            self.store_metric(
                'system.network.bytes_recv',
                'counter',
                network.bytes_recv,
                {'host': 'local', 'interface': 'total'}
            )
            
            # Process count
            process_count = len(psutil.pids())
            self.store_metric(
                'system.processes.count',
                'gauge',
                process_count,
                {'host': 'local'}
            )
            
            self.infrastructure_metrics = {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': (disk.used / disk.total) * 100,
                'process_count': process_count
            }
            
            logger.debug("Infrastructure metrics collected successfully")
            
        except Exception as e:
            logger.error(f"Failed to collect infrastructure metrics: {str(e)}")
    
    def store_metric(self, name: str, metric_type: str, value: float, 
                    tags: Dict = None, source: str = None, metadata: Dict = None):
        """Store a monitoring metric"""
        try:
            metric = MonitoringMetric(
                metric_name=name,
                metric_type=metric_type,
                value=value,
                timestamp=datetime.utcnow(),
                tags=tags or {},
                source=source or 'monitoring_service',
                metadata=metadata or {}
            )
            
            metric.save()
            
        except Exception as e:
            logger.error(f"Failed to store metric {name}: {str(e)}")
    
    # Health Checks
    def register_health_check(self, service_name: str, check_function: Callable, 
                            check_type: str = 'custom', metadata: Dict = None):
        """Register a custom health check"""
        try:
            # Store the check function for later execution
            if not hasattr(self, '_health_checks'):
                self._health_checks = {}
            
            self._health_checks[service_name] = {
                'function': check_function,
                'type': check_type,
                'metadata': metadata or {}
            }
            
            logger.info(f"Health check registered for service: {service_name}")
            
        except Exception as e:
            logger.error(f"Failed to register health check for {service_name}: {str(e)}")
    
    def run_health_checks(self):
        """Execute all registered health checks"""
        try:
            if not hasattr(self, '_health_checks'):
                return
            
            for service_name, check_info in self._health_checks.items():
                try:
                    start_time = time.time()
                    result = check_info['function']()
                    response_time = (time.time() - start_time) * 1000  # Convert to ms
                    
                    # Store health check result
                    health_check = HealthCheck(
                        service_name=service_name,
                        check_type=check_info['type'],
                        status=result.get('status', 'unknown'),
                        response_time=response_time,
                        status_code=result.get('status_code'),
                        error_message=result.get('message'),
                        metadata={**check_info['metadata'], **result.get('metadata', {})}
                    )
                    health_check.save()
                    
                    logger.debug(f"Health check completed for {service_name}: {result.get('status')}")
                    
                except Exception as e:
                    logger.error(f"Health check failed for {service_name}: {str(e)}")
                    
                    # Store error result
                    health_check = HealthCheck(
                        service_name=service_name,
                        check_type=check_info['type'],
                        status='unhealthy',
                        error_message=str(e),
                        metadata={'error': str(e)}
                    )
                    health_check.save()
            
        except Exception as e:
            logger.error(f"Failed to run health checks: {str(e)}")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get overall system health status"""
        try:
            # Get recent health checks
            recent_checks = HealthCheck.query.filter(
                HealthCheck.timestamp >= datetime.utcnow() - timedelta(minutes=5)
            ).all()
            
            # Group by service
            service_status = {}
            for check in recent_checks:
                if check.service_name not in service_status:
                    service_status[check.service_name] = {
                        'status': 'unknown',
                        'last_check': None,
                        'response_time': None
                    }
                
                # Update if this check is more recent or better status
                if (not service_status[check.service_name]['last_check'] or 
                    check.timestamp > service_status[check.service_name]['last_check']):
                    service_status[check.service_name]['status'] = check.status
                    service_status[check.service_name]['last_check'] = check.timestamp
                    service_status[check.service_name]['response_time'] = check.response_time
            
            # Determine overall health
            unhealthy_services = [
                name for name, status in service_status.items() 
                if status['status'] in ['unhealthy', 'degraded']
            ]
            
            if len(unhealthy_services) == 0:
                overall_status = 'healthy'
            elif len(unhealthy_services) < len(service_status) * 0.5:
                overall_status = 'degraded'
            else:
                overall_status = 'unhealthy'
            
            return {
                'status': overall_status,
                'timestamp': datetime.utcnow().isoformat(),
                'services': service_status,
                'unhealthy_count': len(unhealthy_services),
                'total_services': len(service_status)
            }
            
        except Exception as e:
            logger.error(f"Failed to get health status: {str(e)}")
            return {
                'status': 'unknown',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    # Alert Management
    def create_alert(self, title: str, description: str, severity: AlertSeverity,
                    source: str, metric_name: str, threshold: float, current_value: float,
                    tags: List[str] = None, metadata: Dict[str, Any] = None) -> str:
        """Create a new alert"""
        try:
            alert_id = str(uuid.uuid4())
            
            alert = Alert(
                id=alert_id,
                title=title,
                description=description,
                severity=severity,
                status=AlertStatus.ACTIVE,
                source=source,
                metric_name=metric_name,
                threshold=threshold,
                current_value=current_value,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                tags=tags or [],
                metadata=metadata or {}
            )
            
            # Store in database
            system_alert = SystemAlert(alert)
            system_alert.save()
            
            # Notify callbacks
            for callback in self.alert_callbacks:
                try:
                    callback(alert)
                except Exception as e:
                    logger.error(f"Alert callback failed: {str(e)}")
            
            logger.info(f"Alert created: {title} (ID: {alert_id})")
            return alert_id
            
        except Exception as e:
            logger.error(f"Failed to create alert: {str(e)}")
            return None
    
    def acknowledge_alert(self, alert_id: str, acknowledged_by: str):
        """Acknowledge an alert"""
        try:
            alert = SystemAlert.query.filter_by(id=alert_id).first()
            if not alert:
                return False
            
            alert.status = AlertStatus.ACKNOWLEDGED.value
            alert.acknowledged_at = datetime.utcnow()
            alert.acknowledged_by = acknowledged_by
            alert.updated_at = datetime.utcnow()
            alert.save()
            
            logger.info(f"Alert acknowledged: {alert_id} by {acknowledged_by}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to acknowledge alert {alert_id}: {str(e)}")
            return False
    
    def resolve_alert(self, alert_id: str, resolved_by: str):
        """Resolve an alert"""
        try:
            alert = SystemAlert.query.filter_by(id=alert_id).first()
            if not alert:
                return False
            
            alert.status = AlertStatus.RESOLVED.value
            alert.resolved_at = datetime.utcnow()
            alert.resolved_by = resolved_by
            alert.updated_at = datetime.utcnow()
            alert.save()
            
            logger.info(f"Alert resolved: {alert_id} by {resolved_by}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to resolve alert {alert_id}: {str(e)}")
            return False
    
    def get_active_alerts(self, severity: AlertSeverity = None) -> List[Dict]:
        """Get active alerts, optionally filtered by severity"""
        try:
            query = SystemAlert.query.filter_by(status=AlertStatus.ACTIVE.value)
            
            if severity:
                query = query.filter_by(severity=severity.value)
            
            alerts = query.order_by(SystemAlert.created_at.desc()).limit(100).all()
            
            return [alert.to_dict() for alert in alerts]
            
        except Exception as e:
            logger.error(f"Failed to get active alerts: {str(e)}")
            return []
    
    def add_alert_callback(self, callback: Callable):
        """Add a callback function to be called when alerts are created"""
        self.alert_callbacks.append(callback)
    
    # Incident Management
    def create_incident(self, title: str, description: str, severity: AlertSeverity,
                      priority: str, created_by: str, affected_services: List[str] = None,
                      related_alerts: List[str] = None) -> str:
        """Create a new incident"""
        try:
            incident_id = str(uuid.uuid4())
            
            incident = Incident(
                id=incident_id,
                title=title,
                description=description,
                status=IncidentStatus.OPEN.value,
                severity=severity.value,
                priority=priority,
                created_by=created_by,
                affected_services=affected_services or [],
                related_alerts=related_alerts or [],
                timeline=[{
                    'timestamp': datetime.utcnow().isoformat(),
                    'action': 'created',
                    'user': created_by,
                    'description': 'Incident created'
                }]
            )
            
            incident.save()
            
            logger.info(f"Incident created: {title} (ID: {incident_id})")
            return incident_id
            
        except Exception as e:
            logger.error(f"Failed to create incident: {str(e)}")
            return None
    
    def update_incident_status(self, incident_id: str, status: IncidentStatus, 
                             updated_by: str, description: str = None):
        """Update incident status"""
        try:
            incident = Incident.query.filter_by(id=incident_id).first()
            if not incident:
                return False
            
            incident.status = status.value
            incident.updated_at = datetime.utcnow()
            
            # Add timeline entry
            timeline = incident.timeline or []
            timeline.append({
                'timestamp': datetime.utcnow().isoformat(),
                'action': 'status_changed',
                'user': updated_by,
                'from_status': incident.status,
                'to_status': status.value,
                'description': description or f'Status changed to {status.value}'
            })
            incident.timeline = timeline
            
            if status == IncidentStatus.RESOLVED:
                incident.resolved_at = datetime.utcnow()
            
            incident.save()
            
            logger.info(f"Incident status updated: {incident_id} to {status.value}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update incident {incident_id}: {str(e)}")
            return False
    
    # Synthetic Monitoring
    def create_synthetic_check(self, name: str, url: str, check_type: str,
                             frequency: int, expected_status: int = None,
                             expected_content: str = None, headers: Dict = None,
                             authentication: Dict = None, created_by: str = None) -> str:
        """Create a new synthetic monitoring check"""
        try:
            check_id = str(uuid.uuid4())
            
            check = SyntheticCheck(
                id=check_id,
                name=name,
                url=url,
                check_type=check_type,
                frequency=frequency,
                expected_status=expected_status,
                expected_content=expected_content,
                headers=headers,
                authentication=authentication,
                created_by=created_by
            )
            
            check.save()
            
            logger.info(f"Synthetic check created: {name} (ID: {check_id})")
            return check_id
            
        except Exception as e:
            logger.error(f"Failed to create synthetic check: {str(e)}")
            return None
    
    def run_synthetic_check(self, check_id: str) -> Dict[str, Any]:
        """Run a synthetic check"""
        try:
            check = SyntheticCheck.query.filter_by(id=check_id).first()
            if not check:
                return {'status': 'error', 'message': 'Check not found'}
            
            start_time = time.time()
            
            if check.check_type in ['http', 'https']:
                response = requests.get(
                    check.url,
                    headers=check.headers,
                    auth=check.authentication and (check.authentication.get('username'), 
                                                 check.authentication.get('password')),
                    timeout=check.timeout
                )
                
                response_time = (time.time() - start_time) * 1000
                
                # Check status code
                status = 'success'
                if check.expected_status and response.status_code != check.expected_status:
                    status = 'failure'
                
                # Check content
                content_checks = {}
                if check.expected_content:
                    content_checks['contains_expected'] = check.expected_content in response.text
                    if not content_checks['contains_expected']:
                        status = 'failure'
                
                # Store result
                result = SyntheticResult(
                    check_id=check_id,
                    status=status,
                    response_time=response_time,
                    status_code=response.status_code,
                    content_checks=content_checks,
                    performance_metrics={
                        'content_length': len(response.content),
                        'headers': dict(response.headers)
                    }
                )
                
            else:
                # For other check types (ping, tcp, etc.)
                status = 'success'  # Simplified for this example
                response_time = (time.time() - start_time) * 1000
                
                result = SyntheticResult(
                    check_id=check_id,
                    status=status,
                    response_time=response_time
                )
            
            result.save()
            
            # Update check statistics
            check.last_run = datetime.utcnow()
            check.next_run = datetime.utcnow() + timedelta(seconds=check.frequency)
            
            # Update success rate
            recent_results = SyntheticResult.query.filter_by(check_id=check_id)\
                .order_by(SyntheticResult.timestamp.desc()).limit(100).all()
            
            if recent_results:
                success_count = sum(1 for r in recent_results if r.status == 'success')
                check.success_rate = (success_count / len(recent_results)) * 100
                
                # Calculate average response time
                valid_times = [r.response_time for r in recent_results if r.response_time]
                check.avg_response_time = sum(valid_times) / len(valid_times) if valid_times else None
            
            check.save()
            
            logger.debug(f"Synthetic check completed: {check.name} - {status}")
            return result.to_dict()
            
        except requests.exceptions.Timeout:
            result = SyntheticResult(
                check_id=check_id,
                status='timeout',
                error_message='Request timeout'
            )
            result.save()
            return result.to_dict()
            
        except Exception as e:
            logger.error(f"Synthetic check failed: {str(e)}")
            result = SyntheticResult(
                check_id=check_id,
                status='error',
                error_message=str(e)
            )
            result.save()
            return result.to_dict()
    
    def run_synthetic_checks(self):
        """Run all due synthetic checks"""
        try:
            due_checks = SyntheticCheck.query.filter(
                SyntheticCheck.status == 'active',
                SyntheticCheck.next_run <= datetime.utcnow()
            ).all()
            
            for check in due_checks:
                self.run_synthetic_check(check.id)
            
            logger.debug(f"Completed {len(due_checks)} synthetic checks")
            
        except Exception as e:
            logger.error(f"Failed to run synthetic checks: {str(e)}")
    
    # SLA Monitoring
    def calculate_sla_metrics(self):
        """Calculate SLA metrics for all services"""
        try:
            # Get all services that have metrics
            service_names = set()
            
            # Add from monitoring metrics
            for metric in MonitoringMetric.query.distinct(MonitoringMetric.source):
                service_names.add(metric.source)
            
            # Add from synthetic checks
            for check in SyntheticCheck.query.distinct(SyntheticCheck.id):
                service_names.add(f"synthetic_{check.id}")
            
            for service_name in service_names:
                # Calculate availability SLA (uptime percentage)
                now = datetime.utcnow()
                period_start = now - timedelta(hours=1)  # Last hour
                
                # Get health checks for this service
                health_checks = HealthCheck.query.filter(
                    HealthCheck.service_name == service_name,
                    HealthCheck.timestamp >= period_start
                ).all()
                
                if health_checks:
                    healthy_checks = [h for h in health_checks if h.status == 'healthy']
                    availability = (len(healthy_checks) / len(health_checks)) * 100
                    
                    sla_metric = SLAMetric(
                        service_name=service_name,
                        metric_type='availability',
                        target_value=99.9,  # 99.9% uptime target
                        actual_value=availability,
                        period_start=period_start,
                        period_end=now,
                        met_sla=availability >= 99.9,
                        violations=len(health_checks) - len(healthy_checks)
                    )
                    sla_metric.save()
            
            logger.debug("SLA metrics calculated successfully")
            
        except Exception as e:
            logger.error(f"Failed to calculate SLA metrics: {str(e)}")
    
    # Alert Rules
    def create_alert_rule(self, name: str, metric_name: str, condition: str,
                         threshold: float, severity: AlertSeverity, duration: int = 300,
                         notification_channels: List[str] = None, created_by: str = None) -> str:
        """Create an alert rule"""
        try:
            rule_id = str(uuid.uuid4())
            
            rule = AlertRule(
                id=rule_id,
                name=name,
                metric_name=metric_name,
                condition=condition,
                threshold=threshold,
                severity=severity.value,
                duration=duration,
                notification_channels=notification_channels or [],
                created_by=created_by
            )
            
            rule.save()
            
            logger.info(f"Alert rule created: {name} (ID: {rule_id})")
            return rule_id
            
        except Exception as e:
            logger.error(f"Failed to create alert rule: {str(e)}")
            return None
    
    def evaluate_alert_rules(self):
        """Evaluate all alert rules against current metrics"""
        try:
            rules = AlertRule.query.filter_by(enabled=True).all()
            
            for rule in rules:
                try:
                    self._evaluate_single_rule(rule)
                except Exception as e:
                    logger.error(f"Failed to evaluate rule {rule.name}: {str(e)}")
            
            logger.debug(f"Evaluated {len(rules)} alert rules")
            
        except Exception as e:
            logger.error(f"Failed to evaluate alert rules: {str(e)}")
    
    def _evaluate_single_rule(self, rule: AlertRule):
        """Evaluate a single alert rule"""
        try:
            # Get recent metrics for this rule
            cutoff_time = datetime.utcnow() - timedelta(seconds=rule.duration)
            
            metrics = MonitoringMetric.query.filter(
                MonitoringMetric.metric_name == rule.metric_name,
                MonitoringMetric.timestamp >= cutoff_time
            ).order_by(MonitoringMetric.timestamp.desc()).all()
            
            if not metrics:
                return
            
            # Check if condition is met for the required duration
            condition_met = self._check_condition(metrics, rule.condition, rule.threshold)
            
            # Check if there's already an active alert for this rule
            existing_alert = SystemAlert.query.filter_by(
                metric_name=rule.metric_name,
                status=AlertStatus.ACTIVE.value
            ).first()
            
            if condition_met and not existing_alert:
                # Create new alert
                current_value = metrics[0].value
                
                self.create_alert(
                    title=f"{rule.name} - Threshold exceeded",
                    description=f"Metric {rule.metric_name} {rule.condition} {rule.threshold} for {rule.duration} seconds. Current value: {current_value}",
                    severity=AlertSeverity(rule.severity),
                    source='alert_rule',
                    metric_name=rule.metric_name,
                    threshold=rule.threshold,
                    current_value=current_value,
                    tags=rule.tags or [],
                    metadata={'rule_id': rule.id}
                )
            
            elif not condition_met and existing_alert:
                # Resolve existing alert
                self.resolve_alert(existing_alert.id, 'system')
            
        except Exception as e:
            logger.error(f"Failed to evaluate rule {rule.id}: {str(e)}")
    
    def _check_condition(self, metrics: List[MonitoringMetric], condition: str, threshold: float) -> bool:
        """Check if metrics meet the condition"""
        if condition == 'greater_than':
            return any(m.value > threshold for m in metrics)
        elif condition == 'less_than':
            return any(m.value < threshold for m in metrics)
        elif condition == 'equals':
            return any(abs(m.value - threshold) < 0.001 for m in metrics)  # Float comparison
        elif condition == 'not_equals':
            return all(abs(m.value - threshold) >= 0.001 for m in metrics)
        else:
            return False
    
    # Log Management
    def log_entry(self, level: str, source: str, message: str, 
                  service: str = None, user_id: str = None, request_id: str = None,
                  session_id: str = None, stack_trace: str = None, metadata: Dict = None):
        """Log an entry"""
        try:
            log_entry = LogEntry(
                level=level.upper(),
                source=source,
                message=message,
                service=service,
                user_id=user_id,
                request_id=request_id,
                session_id=session_id,
                stack_trace=stack_trace,
                metadata=metadata or {},
                indexed_fields={
                    'level': level.upper(),
                    'source': source,
                    'service': service,
                    'timestamp_hour': datetime.utcnow().strftime('%Y-%m-%d-%H')
                }
            )
            
            log_entry.save()
            
        except Exception as e:
            logger.error(f"Failed to log entry: {str(e)}")
    
    def get_logs(self, level: str = None, source: str = None, service: str = None,
                limit: int = 100) -> List[Dict]:
        """Get log entries with optional filtering"""
        try:
            query = LogEntry.query
            
            if level:
                query = query.filter_by(level=level.upper())
            if source:
                query = query.filter_by(source=source)
            if service:
                query = query.filter_by(service=service)
            
            logs = query.order_by(LogEntry.timestamp.desc()).limit(limit).all()
            
            return [log.to_dict() for log in logs]
            
        except Exception as e:
            logger.error(f"Failed to get logs: {str(e)}")
            return []

# Global monitoring service instance
monitoring_service = MonitoringService()

def get_monitoring_service() -> MonitoringService:
    """Get the global monitoring service instance"""
    return monitoring_service