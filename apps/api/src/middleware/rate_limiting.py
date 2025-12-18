#!/usr/bin/env python3
"""
Advanced Rate Limiting Middleware for Crazy-Gary API
Implements sophisticated rate limiting with Redis support and multiple strategies
"""

import redis
import time
import json
import hashlib
from typing import Dict, Optional, Tuple, Callable
from functools import wraps
from flask import request, jsonify, g
from werkzeug.exceptions import TooManyRequests
import os
from datetime import datetime, timedelta


class RateLimiter:
    """Advanced rate limiter with Redis backend support"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv('REDIS_URL', 'memory://')
        self.redis_client = None
        self.in_memory_store = {}  # Fallback for development
        
        if self.redis_url != 'memory://':
            try:
                self.redis_client = redis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_timeout=5,
                    socket_connect_timeout=5
                )
                # Test connection
                self.redis_client.ping()
            except Exception as e:
                print(f"Redis connection failed: {e}. Using in-memory store.")
                self.redis_client = None
    
    def _get_redis_key(self, identifier: str, window: str) -> str:
        """Generate Redis key for rate limiting"""
        return f"rate_limit:{identifier}:{window}"
    
    def _get_memory_key(self, identifier: str, window: str) -> Dict:
        """Get in-memory rate limiting data"""
        key = f"{identifier}:{window}"
        if key not in self.in_memory_store:
            self.in_memory_store[key] = {
                'count': 0,
                'reset_time': time.time() + self._get_window_seconds(window)
            }
        return self.in_memory_store[key]
    
    def _get_window_seconds(self, window: str) -> int:
        """Convert window string to seconds"""
        window_mapping = {
            '1s': 1,
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '1h': 3600,
            '1d': 86400
        }
        return window_mapping.get(window, 60)
    
    def is_rate_limited(
        self,
        identifier: str,
        limit: int,
        window: str = '1m',
        strategy: str = 'sliding_window'
    ) -> Tuple[bool, Dict]:
        """
        Check if identifier is rate limited
        
        Args:
            identifier: Unique identifier (IP, user ID, etc.)
            limit: Maximum requests allowed
            window: Time window (1s, 1m, 1h, 1d)
            strategy: Rate limiting strategy (fixed_window, sliding_window, token_bucket)
        
        Returns:
            Tuple of (is_limited, info_dict)
        """
        current_time = time.time()
        window_seconds = self._get_window_seconds(window)
        
        if self.redis_client:
            return self._redis_rate_limited(identifier, limit, window_seconds, strategy, current_time)
        else:
            return self._memory_rate_limited(identifier, limit, window_seconds, current_time)
    
    def _redis_rate_limited(
        self,
        identifier: str,
        limit: int,
        window_seconds: int,
        strategy: str,
        current_time: float
    ) -> Tuple[bool, Dict]:
        """Redis-based rate limiting"""
        if strategy == 'sliding_window':
            return self._redis_sliding_window(identifier, limit, window_seconds, current_time)
        elif strategy == 'fixed_window':
            return self._redis_fixed_window(identifier, limit, window_seconds, current_time)
        else:
            return self._redis_sliding_window(identifier, limit, window_seconds, current_time)
    
    def _redis_sliding_window(
        self,
        identifier: str,
        limit: int,
        window_seconds: int,
        current_time: float
    ) -> Tuple[bool, Dict]:
        """Sliding window rate limiting using Redis sorted sets"""
        window_key = f"{int(current_time / window_seconds)}"
        redis_key = self._get_redis_key(identifier, window_key)
        
        # Remove old entries
        cutoff = current_time - window_seconds
        self.redis_client.zremrangebyscore(redis_key, 0, cutoff)
        
        # Count current requests
        current_requests = self.redis_client.zcard(redis_key)
        
        # Add current request
        self.redis_client.zadd(redis_key, {str(current_time): current_time})
        self.redis_client.expire(redis_key, window_seconds * 2)
        
        is_limited = current_requests >= limit
        reset_time = int(current_time) + window_seconds
        
        return is_limited, {
            'limit': limit,
            'remaining': max(0, limit - current_requests - 1),
            'reset': reset_time,
            'window': window_seconds
        }
    
    def _redis_fixed_window(
        self,
        identifier: str,
        limit: int,
        window_seconds: int,
        current_time: float
    ) -> Tuple[bool, Dict]:
        """Fixed window rate limiting using Redis INCR"""
        window_start = int(current_time / window_seconds) * window_seconds
        redis_key = self._get_redis_key(identifier, str(window_start))
        
        current_requests = self.redis_client.incr(redis_key)
        if current_requests == 1:
            self.redis_client.expire(redis_key, window_seconds)
        
        is_limited = current_requests > limit
        reset_time = window_start + window_seconds
        
        return is_limited, {
            'limit': limit,
            'remaining': max(0, limit - current_requests),
            'reset': reset_time,
            'window': window_seconds
        }
    
    def _memory_rate_limited(
        self,
        identifier: str,
        limit: int,
        window_seconds: int,
        current_time: float
    ) -> Tuple[bool, Dict]:
        """In-memory rate limiting (development only)"""
        data = self._get_memory_key(identifier, f"{window_seconds}s")
        
        # Reset if window has passed
        if current_time > data['reset_time']:
            data['count'] = 0
            data['reset_time'] = current_time + window_seconds
        
        data['count'] += 1
        
        is_limited = data['count'] > limit
        reset_time = int(data['reset_time'])
        
        return is_limited, {
            'limit': limit,
            'remaining': max(0, limit - data['count']),
            'reset': reset_time,
            'window': window_seconds
        }


class RateLimitDecorator:
    """Rate limiting decorator for Flask routes"""
    
    def __init__(self, limiter: RateLimiter):
        self.limiter = limiter
    
    def __call__(
        self,
        limit: int,
        window: str = '1m',
        strategy: str = 'sliding_window',
        identifier_func: Optional[Callable] = None
    ):
        """Decorator to rate limit a Flask route"""
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                # Get client identifier
                if identifier_func:
                    identifier = identifier_func(request)
                else:
                    # Default: use IP address
                    identifier = self._get_client_identifier(request)
                
                # Check rate limit
                is_limited, info = self.limiter.is_rate_limited(
                    identifier, limit, window, strategy
                )
                
                if is_limited:
                    # Add rate limit headers
                    g.rate_limit_info = info
                    raise TooManyRequests(
                        description=f"Rate limit exceeded. Try again in {info['reset'] - int(time.time())} seconds."
                    )
                
                # Add rate limit info to g for response headers
                g.rate_limit_info = info
                
                return f(*args, **kwargs)
            return decorated_function
        return decorator
    
    def _get_client_identifier(self, request) -> str:
        """Get client identifier from request"""
        # Try to get real IP behind proxy
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        # Fall back to remote address
        return request.remote_addr or 'unknown'


# Pre-configured rate limiters for different endpoints
def get_rate_limiter() -> RateLimiter:
    """Get configured rate limiter instance"""
    redis_url = os.getenv('REDIS_URL')
    return RateLimiter(redis_url)


def create_rate_limit_decorator(limit: int, window: str = '1m', strategy: str = 'sliding_window'):
    """Create a rate limit decorator with predefined settings"""
    limiter = get_rate_limiter()
    decorator = RateLimitDecorator(limiter)
    return decorator(limit, window, strategy)


# Common rate limiting strategies
api_rate_limit = create_rate_limit_decorator(100, '1m', 'sliding_window')  # 100 requests per minute
login_rate_limit = create_rate_limit_decorator(5, '1m', 'fixed_window')    # 5 login attempts per minute
registration_rate_limit = create_rate_limit_decorator(3, '10m', 'fixed_window')  # 3 registrations per 10 minutes
upload_rate_limit = create_rate_limit_decorator(10, '1h', 'sliding_window')  # 10 uploads per hour
search_rate_limit = create_rate_limit_decorator(50, '1m', 'sliding_window')  # 50 searches per minute


# Endpoint-specific rate limiting
def limit_by_user_id(f):
    """Rate limit by user ID (for authenticated endpoints)"""
    decorator = create_rate_limit_decorator(1000, '1h', 'sliding_window')
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user ID from request context (implement based on your auth system)
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            raise TooManyRequests("Authentication required for this endpoint")
        
        # Override identifier function
        def get_user_identifier(request):
            return f"user:{user_id}"
        
        original_decorator = create_rate_limit_decorator(1000, '1h', 'sliding_window')
        return original_decorator(get_user_identifier)(f)(*args, **kwargs)
    
    return decorated_function


def limit_by_api_key(f):
    """Rate limit by API key (for API endpoints)"""
    def get_api_key_identifier(request):
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        if api_key:
            return f"api_key:{hashlib.md5(api_key.encode()).hexdigest()[:8]}"
        return f"ip:{request.remote_addr}"
    
    decorator = create_rate_limit_decorator(1000, '1h', 'sliding_window')
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        def custom_identifier(req):
            return get_api_key_identifier(req)
        
        original_decorator = create_rate_limit_decorator(1000, '1h', 'sliding_window')
        return original_decorator(custom_identifier)(f)(*args, **kwargs)
    
    return decorated_function


# Rate limit response headers middleware
def add_rate_limit_headers(response):
    """Add rate limit headers to response"""
    if hasattr(g, 'rate_limit_info'):
        info = g.rate_limit_info
        response.headers['X-RateLimit-Limit'] = str(info['limit'])
        response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
        response.headers['X-RateLimit-Reset'] = str(info['reset'])
    
    return response


# Global rate limiting middleware
def setup_global_rate_limiting(app):
    """Setup global rate limiting for the Flask app"""
    limiter = get_rate_limiter()
    
    @app.before_request
    def global_rate_limit():
        """Apply global rate limit to all requests"""
        identifier = request.remote_addr
        is_limited, info = limiter.is_rate_limited(identifier, 1000, '1h', 'sliding_window')
        
        if is_limited:
            raise TooManyRequests("Global rate limit exceeded")
        
        g.rate_limit_info = info
    
    @app.after_request
    def add_rate_limit_response_headers(response):
        return add_rate_limit_headers(response)
    
    # Error handler for rate limit exceeded
    @app.errorhandler(429)
    def handle_rate_limit_exceeded(error):
        response_data = {
            'error': 'Rate limit exceeded',
            'message': error.description if hasattr(error, 'description') else 'Too many requests',
            'retry_after': 60
        }
        
        if hasattr(g, 'rate_limit_info'):
            info = g.rate_limit_info
            response_data.update({
                'limit': info['limit'],
                'remaining': info['remaining'],
                'reset': info['reset']
            })
        
        response = jsonify(response_data)
        response.status_code = 429
        response.headers['Retry-After'] = '60'
        
        return add_rate_limit_headers(response)