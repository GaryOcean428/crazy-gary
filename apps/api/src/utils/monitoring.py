#!/usr/bin/env python3
"""
Enhanced monitoring and error handling for Railway deployment
"""

import os
import sys
import json
import time
import logging
import traceback
from functools import wraps
from typing import Dict, Any, Optional
from flask import request, g, current_app
import psutil


class PerformanceMonitor:
    """Monitor application performance and resource usage"""
    
    def __init__(self):
        self.start_time = time.time()
        self.request_count = 0
        self.error_count = 0
        
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        try:
            memory = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=1)
            disk = psutil.disk_usage('/')
            
            return {
                'uptime': time.time() - self.start_time,
                'cpu_percent': cpu_percent,
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent,
                    'used': memory.used
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': (disk.used / disk.total) * 100
                },
                'requests_total': self.request_count,
                'errors_total': self.error_count
            }
        except Exception as e:
            logging.error("System metrics retrieval failed", exc_info=True)
            return {'error': 'Failed to get system metrics. Please contact support.'}
    
    def record_request(self):
        """Record a request"""
        self.request_count += 1
    
    def record_error(self):
        """Record an error"""
        self.error_count += 1


# Global performance monitor instance
performance_monitor = PerformanceMonitor()


def monitor_performance(f):
    """Decorator to monitor endpoint performance"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        performance_monitor.record_request()
        
        try:
            result = f(*args, **kwargs)
            duration = time.time() - start_time
            
            # Log slow requests
            if duration > 2.0:  # 2 seconds threshold
                current_app.logger.warning(
                    f"Slow request: {request.path} took {duration:.2f}s",
                    extra={
                        'endpoint': request.endpoint,
                        'method': request.method,
                        'duration': duration,
                        'slow_request': True
                    }
                )
            
            return result
            
        except Exception as e:
            performance_monitor.record_error()
            duration = time.time() - start_time
            
            current_app.logger.error(
                f"Request error: {request.path} failed after {duration:.2f}s",
                extra={
                    'endpoint': request.endpoint,
                    'method': request.method,
                    'duration': duration,
                    'error': str(e),
                    'traceback': traceback.format_exc()
                }
            )
            raise
    
    return decorated_function


class StructuredLogger:
    """Structured logging for Railway deployment"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize structured logging"""
        # Configure logging format
        log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
        
        # Create formatter for Railway logs
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(log_level)
        
        # Add console handler for Railway
        if not root_logger.handlers:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(formatter)
            root_logger.addHandler(console_handler)
        
        # Set up application logger
        app.logger.setLevel(log_level)
        
        # Add request logging
        @app.before_request
        def log_request():
            g.start_time = time.time()
            
            app.logger.info(
                f"Request started: {request.method} {request.path}",
                extra={
                    'method': request.method,
                    'path': request.path,
                    'ip': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
                    'user_agent': request.headers.get('User-Agent'),
                    'request_id': id(request)
                }
            )
        
        @app.after_request
        def log_response(response):
            duration = time.time() - g.get('start_time', time.time())
            
            app.logger.info(
                f"Request completed: {request.method} {request.path} - {response.status_code}",
                extra={
                    'method': request.method,
                    'path': request.path,
                    'status_code': response.status_code,
                    'duration': duration,
                    'request_id': id(request)
                }
            )
            
            return response


def setup_monitoring(app):
    """Setup comprehensive monitoring for the Flask app"""
    # Initialize structured logging
    StructuredLogger(app)
    
    # Add performance monitoring endpoint
    @app.route('/api/metrics')
    @monitor_performance
    def metrics():
        """Get application metrics"""
        return {
            'status': 'healthy',
            'timestamp': time.time(),
            'environment': os.getenv('ENVIRONMENT', 'development'),
            'railway_environment': os.getenv('RAILWAY_ENVIRONMENT'),
            'metrics': performance_monitor.get_system_metrics()
        }
    
    # Enhanced health check with detailed status
    @app.route('/api/health/detailed')
    @monitor_performance
    def detailed_health():
        """Detailed health check with dependency status"""
        checks = {
            'status': 'healthy',
            'timestamp': time.time(),
            'version': '1.0.0',
            'environment': os.getenv('ENVIRONMENT', 'development'),
            'dependencies': {}
        }
        
        # Check database connection
        try:
            from src.models.user import db
            with app.app_context():
                db.engine.execute('SELECT 1')
            checks['dependencies']['database'] = 'healthy'
        except Exception as e:
            checks['dependencies']['database'] = f'unhealthy: {str(e)}'
            checks['status'] = 'degraded'
        
        # Check Redis connection if configured
        redis_url = os.getenv('REDIS_URL')
        if redis_url:
            try:
                import redis
                r = redis.from_url(redis_url)
                r.ping()
                checks['dependencies']['redis'] = 'healthy'
            except Exception as e:
                checks['dependencies']['redis'] = f'unhealthy: {str(e)}'
                checks['status'] = 'degraded'
        
        # Check external API endpoints
        huggingface_key = os.getenv('HUGGINGFACE_API_KEY')
        if huggingface_key:
            checks['dependencies']['huggingface'] = 'configured'
        else:
            checks['dependencies']['huggingface'] = 'not_configured'
        
        # Add performance metrics
        checks['performance'] = performance_monitor.get_system_metrics()
        
        status_code = 200 if checks['status'] == 'healthy' else 503
        return checks, status_code
    
    # Error tracking
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Global exception handler with detailed logging"""
        performance_monitor.record_error()
        
        app.logger.error(
            f"Unhandled exception: {str(e)}",
            extra={
                'error_type': type(e).__name__,
                'error_message': str(e),
                'endpoint': request.endpoint,
                'method': request.method,
                'path': request.path,
                'traceback': traceback.format_exc(),
                'request_id': id(request)
            }
        )
        
        # Return different error responses based on environment
        if os.getenv('ENVIRONMENT') == 'production':
            return {
                'error': 'Internal server error',
                'message': 'An unexpected error occurred',
                'request_id': id(request)
            }, 500
        else:
            return {
                'error': 'Internal server error',
                'message': str(e),
                'type': type(e).__name__,
                'traceback': traceback.format_exc(),
                'request_id': id(request)
            }, 500


def setup_railway_monitoring():
    """Setup Railway-specific monitoring and alerting"""
    # Environment variables for monitoring
    monitoring_config = {
        'railway_env': os.getenv('RAILWAY_ENVIRONMENT'),
        'project_id': os.getenv('RAILWAY_PROJECT_ID'),
        'service_id': os.getenv('RAILWAY_SERVICE_ID'),
        'deployment_id': os.getenv('RAILWAY_DEPLOYMENT_ID')
    }
    
    # Log Railway deployment information
    logging.info("Railway deployment information", extra=monitoring_config)
    
    return monitoring_config