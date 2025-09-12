"""
Request Logging Middleware
Logs all HTTP requests and integrates with observability system
"""
import time
from flask import request, g
from src.models.observability import observability_manager
from src.models.auth import get_current_user
from src.models.safety_limits import safety_manager
import logging

logger = logging.getLogger(__name__)

def init_request_logging(app):
    """Initialize request logging middleware"""
    
    @app.before_request
    def before_request():
        """Log request start and perform rate limiting"""
        g.start_time = time.time()
        
        # Skip logging for static files and health checks
        if request.endpoint in ['static', 'monitoring.health_check']:
            return
        
        # Get user for rate limiting
        user = get_current_user()
        if user:
            # Check rate limits
            from src.models.safety_limits import LimitType
            allowed, message = safety_manager.check_rate_limit(user.id, LimitType.REQUESTS_PER_MINUTE)
            if not allowed:
                observability_manager.log_error(
                    "rate_limit_exceeded",
                    f"Rate limit exceeded for user {user.id}: {message}",
                    user_id=user.id
                )
                from flask import jsonify
                return jsonify({'error': message}), 429
            
            # Track the request
            safety_manager.track_request(user.id, request.endpoint or request.path)
    
    @app.after_request
    def after_request(response):
        """Log request completion"""
        if hasattr(g, 'start_time'):
            duration_ms = (time.time() - g.start_time) * 1000
            
            # Skip logging for static files and basic health checks
            if request.endpoint not in ['static', 'monitoring.health_check']:
                user = get_current_user()
                user_id = user.id if user else None
                
                # Log the request
                observability_manager.log_request(
                    method=request.method,
                    path=request.path,
                    status_code=response.status_code,
                    duration_ms=duration_ms,
                    user_id=user_id
                )
                
                # Log errors
                if response.status_code >= 400:
                    observability_manager.log_error(
                        f"http_{response.status_code}",
                        f"{request.method} {request.path} returned {response.status_code}",
                        user_id=user_id
                    )
        
        return response
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Handle uncaught exceptions"""
        user = get_current_user()
        user_id = user.id if user else None
        
        observability_manager.log_error(
            "unhandled_exception",
            str(e),
            stack_trace=str(e),
            user_id=user_id
        )
        
        logger.exception(f"Unhandled exception in {request.method} {request.path}")
        
        from flask import jsonify
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500

