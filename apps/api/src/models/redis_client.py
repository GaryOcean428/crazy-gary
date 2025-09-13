"""
Redis client for session management and caching
"""
import redis
import json
import os
from typing import Optional, Any, Dict
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    """Redis client for session management and caching"""
    
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.client = None
        self.connect()
    
    def connect(self):
        """Connect to Redis"""
        try:
            self.client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            self.client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            # Fallback to in-memory storage for development
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.client:
            return False
        try:
            self.client.ping()
            return True
        except:
            return False
    
    # Session Management
    def set_session(self, session_id: str, user_data: Dict[str, Any], ttl: int = 86400):
        """Set user session data"""
        if not self.client:
            return False
        
        try:
            session_key = f"session:{session_id}"
            self.client.setex(
                session_key,
                ttl,
                json.dumps(user_data)
            )
            return True
        except Exception as e:
            logger.error(f"Failed to set session: {e}")
            return False
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get user session data"""
        if not self.client:
            return None
        
        try:
            session_key = f"session:{session_id}"
            data = self.client.get(session_key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Failed to get session: {e}")
            return None
    
    def delete_session(self, session_id: str) -> bool:
        """Delete user session"""
        if not self.client:
            return False
        
        try:
            session_key = f"session:{session_id}"
            self.client.delete(session_key)
            return True
        except Exception as e:
            logger.error(f"Failed to delete session: {e}")
            return False
    
    def extend_session(self, session_id: str, ttl: int = 86400) -> bool:
        """Extend session TTL"""
        if not self.client:
            return False
        
        try:
            session_key = f"session:{session_id}"
            self.client.expire(session_key, ttl)
            return True
        except Exception as e:
            logger.error(f"Failed to extend session: {e}")
            return False
    
    # Caching
    def set_cache(self, key: str, value: Any, ttl: int = 3600):
        """Set cache value"""
        if not self.client:
            return False
        
        try:
            cache_key = f"cache:{key}"
            self.client.setex(
                cache_key,
                ttl,
                json.dumps(value) if not isinstance(value, str) else value
            )
            return True
        except Exception as e:
            logger.error(f"Failed to set cache: {e}")
            return False
    
    def get_cache(self, key: str) -> Optional[Any]:
        """Get cache value"""
        if not self.client:
            return None
        
        try:
            cache_key = f"cache:{key}"
            data = self.client.get(cache_key)
            if data:
                try:
                    return json.loads(data)
                except json.JSONDecodeError:
                    return data
            return None
        except Exception as e:
            logger.error(f"Failed to get cache: {e}")
            return None
    
    def delete_cache(self, key: str) -> bool:
        """Delete cache value"""
        if not self.client:
            return False
        
        try:
            cache_key = f"cache:{key}"
            self.client.delete(cache_key)
            return True
        except Exception as e:
            logger.error(f"Failed to delete cache: {e}")
            return False
    
    # Rate Limiting
    def check_rate_limit(self, key: str, limit: int, window: int) -> tuple[bool, int]:
        """Check rate limit for a key"""
        if not self.client:
            return True, 0  # Allow if Redis unavailable
        
        try:
            rate_key = f"rate:{key}"
            current = self.client.get(rate_key)
            
            if current is None:
                # First request
                self.client.setex(rate_key, window, 1)
                return True, limit - 1
            
            current_count = int(current)
            if current_count >= limit:
                return False, 0
            
            # Increment counter
            self.client.incr(rate_key)
            return True, limit - (current_count + 1)
            
        except Exception as e:
            logger.error(f"Failed to check rate limit: {e}")
            return True, 0  # Allow if error
    
    # Task Queue (for Heavy Mode)
    def enqueue_task(self, queue: str, task_data: Dict[str, Any]) -> bool:
        """Add task to queue"""
        if not self.client:
            return False
        
        try:
            queue_key = f"queue:{queue}"
            self.client.lpush(queue_key, json.dumps(task_data))
            return True
        except Exception as e:
            logger.error(f"Failed to enqueue task: {e}")
            return False
    
    def dequeue_task(self, queue: str, timeout: int = 1) -> Optional[Dict[str, Any]]:
        """Get task from queue"""
        if not self.client:
            return None
        
        try:
            queue_key = f"queue:{queue}"
            result = self.client.brpop(queue_key, timeout=timeout)
            if result:
                _, task_data = result
                return json.loads(task_data)
            return None
        except Exception as e:
            logger.error(f"Failed to dequeue task: {e}")
            return None
    
    def get_queue_length(self, queue: str) -> int:
        """Get queue length"""
        if not self.client:
            return 0
        
        try:
            queue_key = f"queue:{queue}"
            return self.client.llen(queue_key)
        except Exception as e:
            logger.error(f"Failed to get queue length: {e}")
            return 0
    
    # Real-time Updates
    def publish_update(self, channel: str, message: Dict[str, Any]) -> bool:
        """Publish real-time update"""
        if not self.client:
            return False
        
        try:
            self.client.publish(channel, json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Failed to publish update: {e}")
            return False
    
    def subscribe_updates(self, channels: list[str]):
        """Subscribe to real-time updates"""
        if not self.client:
            return None
        
        try:
            pubsub = self.client.pubsub()
            pubsub.subscribe(*channels)
            return pubsub
        except Exception as e:
            logger.error(f"Failed to subscribe to updates: {e}")
            return None

# Global Redis client instance
redis_client = RedisClient()

