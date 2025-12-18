"""
Monitoring System Setup and Initialization
Initializes all monitoring components and services
"""
import logging
import asyncio
from datetime import datetime, timedelta
from flask import Flask
from typing import Dict, List, Any

# Import all monitoring components
from src.services.monitoring_service import get_monitoring_service, AlertSeverity
from src.services.infrastructure_monitor import get_infrastructure_monitor
from src.services.synthetic_monitor import get_synthetic_monitor
from src.services.external_integrations import get_external_integration_manager
from src.models.monitoring_models import AlertRule, SyntheticCheck, HealthCheck

logger = logging.getLogger(__name__)

class MonitoringSystemInitializer:
    """Initializes and configures the complete monitoring system"""
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.initialized = False
        
    def initialize(self, app: Flask):
        """Initialize the complete monitoring system"""
        try:
            self.app = app
            
            # Initialize core monitoring services
            self._initialize_monitoring_service()
            self._initialize_infrastructure_monitor()
            self._initialize_synthetic_monitor()
            self._initialize_external_integrations()
            
            # Setup database models
            self._setup_database_models()
            
            # Create default monitoring configurations
            self._create_default_alert_rules()
            self._create_default_synthetic_checks()
            self._register_default_health_checks()
            
            # Start background monitoring tasks
            self._start_background_tasks()
            
            # Send startup notifications
            asyncio.create_task(self._send_startup_notifications())
            
            self.initialized = True
            logger.info("✅ Monitoring system initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize monitoring system: {str(e)}")
            raise
    
    def _initialize_monitoring_service(self):
        """Initialize the core monitoring service"""
        try:
            monitoring_service = get_monitoring_service()
            monitoring_service.initialize(self.app)
            logger.info("✅ Monitoring service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize monitoring service: {str(e)}")
            raise
    
    def _initialize_infrastructure_monitor(self):
        """Initialize infrastructure monitoring"""
        try:
            infrastructure_monitor = get_infrastructure_monitor()
            infrastructure_monitor.initialize(self.app)
            logger.info("✅ Infrastructure monitor initialized")
        except Exception as e:
            logger.error(f"Failed to initialize infrastructure monitor: {str(e)}")
            raise
    
    def _initialize_synthetic_monitor(self):
        """Initialize synthetic monitoring"""
        try:
            synthetic_monitor = get_synthetic_monitor()
            synthetic_monitor.initialize()
            logger.info("✅ Synthetic monitor initialized")
        except Exception as e:
            logger.error(f"Failed to initialize synthetic monitor: {str(e)}")
            raise
    
    def _initialize_external_integrations(self):
        """Initialize external integrations"""
        try:
            external_manager = get_external_integration_manager()
            external_manager.initialize(self.app)
            logger.info("✅ External integrations initialized")
        except Exception as e:
            logger.error(f"Failed to initialize external integrations: {str(e)}")
            raise
    
    def _setup_database_models(self):
        """Setup and migrate database models"""
        try:
            # Import all models to ensure they're registered
            from src.models.monitoring_models import (
                MonitoringMetric, SystemAlert, Incident, HealthCheck,
                SLAMetric, LogEntry, SyntheticCheck, SyntheticResult,
                AlertRule
            )
            
            # Create all tables
            with self.app.app_context():
                from src.models.user import db
                db.create_all()
                
            logger.info("✅ Database models setup completed")
            
        except Exception as e:
            logger.error(f"Failed to setup database models: {str(e)}")
            raise
    
    def _create_default_alert_rules(self):
        """Create default alert rules"""
        try:
            monitoring_service = get_monitoring_service()
            
            # CPU Usage Alert
            cpu_rule_id = monitoring_service.create_alert_rule(
                name="High CPU Usage",
                metric_name="system.cpu.usage",
                condition="greater_than",
                threshold=80.0,
                severity=AlertSeverity.HIGH,
                duration=300,  # 5 minutes
                notification_channels=["slack", "email"],
                created_by="system"
            )
            
            # Memory Usage Alert
            memory_rule_id = monitoring_service.create_alert_rule(
                name="High Memory Usage",
                metric_name="system.memory.usage",
                condition="greater_than",
                threshold=85.0,
                severity=AlertSeverity.HIGH,
                duration=300,
                notification_channels=["slack", "email"],
                created_by="system"
            )
            
            # Disk Usage Alert
            disk_rule_id = monitoring_service.create_alert_rule(
                name="High Disk Usage",
                metric_name="system.disk.usage",
                condition="greater_than",
                threshold=90.0,
                severity=AlertSeverity.CRITICAL,
                duration=120,  # 2 minutes
                notification_channels=["slack", "email", "pagerduty"],
                created_by="system"
            )
            
            # Error Rate Alert
            error_rule_id = monitoring_service.create_alert_rule(
                name="High Error Rate",
                metric_name="http.error_rate",
                condition="greater_than",
                threshold=5.0,
                severity=AlertSeverity.MEDIUM,
                duration=180,  # 3 minutes
                notification_channels=["slack"],
                created_by="system"
            )
            
            # Response Time Alert
            response_rule_id = monitoring_service.create_alert_rule(
                name="High Response Time",
                metric_name="http.response_time",
                condition="greater_than",
                threshold=1000.0,  # 1 second
                severity=AlertSeverity.MEDIUM,
                duration=300,
                notification_channels=["slack"],
                created_by="system"
            )
            
            logger.info(f"✅ Created default alert rules: CPU({cpu_rule_id}), Memory({memory_rule_id}), Disk({disk_rule_id}), Error({error_rule_id}), Response({response_rule_id})")
            
        except Exception as e:
            logger.error(f"Failed to create default alert rules: {str(e)}")
    
    def _create_default_synthetic_checks(self):
        """Create default synthetic monitoring checks"""
        try:
            synthetic_monitor = get_synthetic_monitor()
            
            # Health check for the application itself
            app_health_id = synthetic_monitor.create_check(
                name="Application Health",
                url="https://localhost:8080/health",
                check_type="http",
                frequency=300,  # 5 minutes
                timeout=30,
                expected_status=200,
                expected_content="healthy"
            )
            
            # API health check
            api_health_id = synthetic_monitor.create_check(
                name="API Health",
                url="https://localhost:8080/api/health",
                check_type="http",
                frequency=300,
                timeout=30,
                expected_status=200
            )
            
            # Homepage check
            homepage_id = synthetic_monitor.create_check(
                name="Homepage Availability",
                url="https://localhost:8080/",
                check_type="http",
                frequency=600,  # 10 minutes
                timeout=30,
                expected_status=200
            )
            
            logger.info(f"✅ Created default synthetic checks: App Health({app_health_id}), API Health({api_health_id}), Homepage({homepage_id})")
            
        except Exception as e:
            logger.error(f"Failed to create default synthetic checks: {str(e)}")
    
    def _register_default_health_checks(self):
        """Register default health checks"""
        try:
            monitoring_service = get_monitoring_service()
            
            # Database health check
            monitoring_service.register_health_check(
                service_name="database",
                check_type="database",
                check_function=self._check_database_health
            )
            
            # Redis health check (if available)
            monitoring_service.register_health_check(
                service_name="redis",
                check_type="cache",
                check_function=self._check_redis_health
            )
            
            # External API health check
            monitoring_service.register_health_check(
                service_name="external_api",
                check_type="external_api",
                check_function=self._check_external_api_health
            )
            
            # File system health check
            monitoring_service.register_health_check(
                service_name="filesystem",
                check_type="filesystem",
                check_function=self._check_filesystem_health
            )
            
            logger.info("✅ Registered default health checks")
            
        except Exception as e:
            logger.error(f"Failed to register default health checks: {str(e)}")
    
    def _check_database_health(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            from src.models.user import db
            
            # Simple query to test database connectivity
            result = db.session.execute('SELECT 1')
            
            return {
                'status': 'healthy',
                'message': 'Database connection successful',
                'metadata': {'connection_test': 'passed'}
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': f'Database connection failed: {str(e)}',
                'metadata': {'error': str(e)}
            }
    
    def _check_redis_health(self) -> Dict[str, Any]:
        """Check Redis health"""
        try:
            # Try to import redis and check connection
            try:
                import redis
                from src.models.redis_client import get_redis_client
                
                redis_client = get_redis_client()
                redis_client.ping()
                
                return {
                    'status': 'healthy',
                    'message': 'Redis connection successful',
                    'metadata': {'connection_test': 'passed'}
                }
                
            except ImportError:
                return {
                    'status': 'unknown',
                    'message': 'Redis client not available',
                    'metadata': {'redis_client': 'not_installed'}
                }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': f'Redis connection failed: {str(e)}',
                'metadata': {'error': str(e)}
            }
    
    def _check_external_api_health(self) -> Dict[str, Any]:
        """Check external API health"""
        try:
            import requests
            
            # Test external connectivity (e.g., Google DNS)
            response = requests.get('http://8.8.8.8', timeout=5)
            
            return {
                'status': 'healthy',
                'message': 'External API connectivity successful',
                'metadata': {'response_code': response.status_code}
            }
            
        except Exception as e:
            return {
                'status': 'degraded',
                'message': f'External API connectivity issues: {str(e)}',
                'metadata': {'error': str(e)}
            }
    
    def _check_filesystem_health(self) -> Dict[str, Any]:
        """Check filesystem health"""
        try:
            import os
            import psutil
            
            # Check disk space
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            if disk_percent > 95:
                status = 'unhealthy'
                message = f'Critical disk space: {disk_percent:.1f}% used'
            elif disk_percent > 85:
                status = 'degraded'
                message = f'High disk space usage: {disk_percent:.1f}% used'
            else:
                status = 'healthy'
                message = f'Disk space normal: {disk_percent:.1f}% used'
            
            return {
                'status': status,
                'message': message,
                'metadata': {
                    'disk_percent': disk_percent,
                    'free_gb': disk.free / (1024**3),
                    'total_gb': disk.total / (1024**3)
                }
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': f'Filesystem check failed: {str(e)}',
                'metadata': {'error': str(e)}
            }
    
    def _start_background_tasks(self):
        """Start background monitoring tasks"""
        try:
            if not self.app:
                return
            
            # Schedule regular tasks using Flask-APScheduler
            with self.app.app_context():
                # Ensure scheduler is available
                if not hasattr(self.app, 'scheduler'):
                    from apscheduler.schedulers.background import BackgroundScheduler
                    self.app.scheduler = BackgroundScheduler()
                    self.app.scheduler.start()
                
                # Add background monitoring tasks
                self.app.scheduler.add_job(
                    func=self._run_periodic_synthetic_checks,
                    trigger="interval",
                    seconds=600,  # Every 10 minutes
                    id="periodic_synthetic_checks"
                )
                
                self.app.scheduler.add_job(
                    func=self._cleanup_old_data,
                    trigger="interval",
                    hours=24,  # Daily cleanup
                    id="cleanup_old_data"
                )
                
                self.app.scheduler.add_job(
                    func=self._send_heartbeat,
                    trigger="interval",
                    minutes=5,  # Every 5 minutes
                    id="send_heartbeat"
                )
            
            logger.info("✅ Background monitoring tasks started")
            
        except Exception as e:
            logger.error(f"Failed to start background tasks: {str(e)}")
    
    async def _send_startup_notifications(self):
        """Send startup notifications to external systems"""
        try:
            external_manager = get_external_integration_manager()
            await external_manager.send_heartbeat('monitoring-system', 'started')
            
            # Log startup event
            monitoring_service = get_monitoring_service()
            monitoring_service.log_entry(
                level='INFO',
                source='monitoring_setup',
                message='Monitoring system started successfully',
                service='monitoring',
                metadata={'version': '1.0.0', 'initialized_components': [
                    'monitoring_service',
                    'infrastructure_monitor',
                    'synthetic_monitor',
                    'external_integrations'
                ]}
            )
            
            logger.info("✅ Startup notifications sent")
            
        except Exception as e:
            logger.error(f"Failed to send startup notifications: {str(e)}")
    
    def _run_periodic_synthetic_checks(self):
        """Run periodic synthetic checks"""
        try:
            synthetic_monitor = get_synthetic_monitor()
            asyncio.run(synthetic_monitor.run_due_checks())
        except Exception as e:
            logger.error(f"Failed to run periodic synthetic checks: {str(e)}")
    
    def _cleanup_old_data(self):
        """Clean up old monitoring data"""
        try:
            from src.models.monitoring_models import MonitoringMetric, LogEntry, SyntheticResult
            
            cutoff_date = datetime.utcnow() - timedelta(days=30)  # Keep 30 days of data
            
            with self.app.app_context():
                # Clean old metrics
                deleted_metrics = MonitoringMetric.query.filter(
                    MonitoringMetric.timestamp < cutoff_date
                ).delete()
                
                # Clean old logs
                deleted_logs = LogEntry.query.filter(
                    LogEntry.timestamp < cutoff_date
                ).delete()
                
                # Clean old synthetic results
                deleted_results = SyntheticResult.query.filter(
                    SyntheticResult.timestamp < cutoff_date
                ).delete()
                
                # Commit changes
                from src.models.user import db
                db.session.commit()
            
            logger.info(f"✅ Cleaned up old data: {deleted_metrics} metrics, {deleted_logs} logs, {deleted_results} results")
            
        except Exception as e:
            logger.error(f"Failed to cleanup old data: {str(e)}")
    
    def _send_heartbeat(self):
        """Send heartbeat to monitoring systems"""
        try:
            external_manager = get_external_integration_manager()
            asyncio.run(external_manager.send_heartbeat('application', 'running'))
        except Exception as e:
            logger.error(f"Failed to send heartbeat: {str(e)}")
    
    def create_user_journey_checks(self):
        """Create default user journey monitoring checks"""
        try:
            synthetic_monitor = get_synthetic_monitor()
            
            # Simple user journey: Homepage -> Login -> Dashboard
            login_journey_steps = [
                {"action": "navigate", "url": "https://localhost:8080/", "wait": 2000},
                {"action": "click", "url": "https://localhost:8080/login", "wait": 1000},
                {"action": "wait", "duration": 1000}  # Wait for page load
            ]
            
            journey_id = synthetic_monitor.create_user_journey_check(
                name="User Login Flow",
                steps=login_journey_steps,
                frequency=900,  # 15 minutes
                timeout=60
            )
            
            logger.info(f"✅ Created user journey check: Login Flow({journey_id})")
            
        except Exception as e:
            logger.error(f"Failed to create user journey checks: {str(e)}")
    
    def setup_alert_escalation(self):
        """Setup alert escalation rules"""
        try:
            # This would typically be configured through the UI or configuration files
            # For now, we'll create some basic escalation rules in the alert rules
            
            monitoring_service = get_monitoring_service()
            
            # Create escalation for critical alerts
            escalation_rule_id = monitoring_service.create_alert_rule(
                name="Critical Alert Escalation",
                metric_name="*",  # Match all metrics
                condition="greater_than",
                threshold=0,
                severity=AlertSeverity.CRITICAL,
                duration=60,  # 1 minute
                notification_channels=["slack", "email", "pagerduty"],
                created_by="system"
            )
            
            logger.info(f"✅ Setup alert escalation: {escalation_rule_id}")
            
        except Exception as e:
            logger.error(f"Failed to setup alert escalation: {str(e)}")
    
    def get_setup_status(self) -> Dict[str, Any]:
        """Get the status of the monitoring system setup"""
        try:
            status = {
                'initialized': self.initialized,
                'timestamp': datetime.utcnow().isoformat(),
                'components': {
                    'monitoring_service': False,
                    'infrastructure_monitor': False,
                    'synthetic_monitor': False,
                    'external_integrations': False,
                    'database_models': False,
                    'background_tasks': False
                }
            }
            
            # Check component status
            try:
                get_monitoring_service()
                status['components']['monitoring_service'] = True
            except:
                pass
            
            try:
                get_infrastructure_monitor()
                status['components']['infrastructure_monitor'] = True
            except:
                pass
            
            try:
                get_synthetic_monitor()
                status['components']['synthetic_monitor'] = True
            except:
                pass
            
            try:
                get_external_integration_manager()
                status['components']['external_integrations'] = True
            except:
                pass
            
            # Check database models
            try:
                from src.models.monitoring_models import MonitoringMetric
                status['components']['database_models'] = True
            except:
                pass
            
            # Check background tasks
            if self.app and hasattr(self.app, 'scheduler'):
                status['components']['background_tasks'] = True
            
            status['overall_status'] = 'healthy' if all(status['components'].values()) else 'degraded'
            
            return status
            
        except Exception as e:
            return {
                'initialized': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

# Global initializer instance
monitoring_initializer = MonitoringSystemInitializer()

def initialize_monitoring_system(app: Flask):
    """Initialize the complete monitoring system"""
    monitoring_initializer.initialize(app)

def get_monitoring_initializer() -> MonitoringSystemInitializer:
    """Get the monitoring system initializer instance"""
    return monitoring_initializer