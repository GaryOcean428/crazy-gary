"""
Safety Limits and Rate Limiting
Implements safety controls, rate limiting, and resource management
"""
import time
import logging
from datetime import datetime, timedelta, timezone
from collections import defaultdict, deque
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import threading

logger = logging.getLogger(__name__)

class LimitType(Enum):
    REQUESTS_PER_MINUTE = "requests_per_minute"
    REQUESTS_PER_HOUR = "requests_per_hour"
    REQUESTS_PER_DAY = "requests_per_day"
    CONCURRENT_TASKS = "concurrent_tasks"
    TOKENS_PER_MINUTE = "tokens_per_minute"
    TOKENS_PER_HOUR = "tokens_per_hour"
    COST_PER_HOUR = "cost_per_hour"
    COST_PER_DAY = "cost_per_day"

@dataclass
class RateLimit:
    limit_type: LimitType
    limit: int
    window_seconds: int
    current_count: int = 0
    reset_time: Optional[datetime] = None

@dataclass
class UserLimits:
    user_id: int
    tier: str = "free"  # free, pro, enterprise
    limits: Dict[LimitType, RateLimit] = None
    
    def __post_init__(self):
        if self.limits is None:
            self.limits = self._get_default_limits()
    
    def _get_default_limits(self) -> Dict[LimitType, RateLimit]:
        """Get default limits based on user tier"""
        if self.tier == "free":
            return {
                LimitType.REQUESTS_PER_MINUTE: RateLimit(LimitType.REQUESTS_PER_MINUTE, 10, 60),
                LimitType.REQUESTS_PER_HOUR: RateLimit(LimitType.REQUESTS_PER_HOUR, 100, 3600),
                LimitType.REQUESTS_PER_DAY: RateLimit(LimitType.REQUESTS_PER_DAY, 500, 86400),
                LimitType.CONCURRENT_TASKS: RateLimit(LimitType.CONCURRENT_TASKS, 2, 0),
                LimitType.TOKENS_PER_MINUTE: RateLimit(LimitType.TOKENS_PER_MINUTE, 10000, 60),
                LimitType.TOKENS_PER_HOUR: RateLimit(LimitType.TOKENS_PER_HOUR, 100000, 3600),
                LimitType.COST_PER_HOUR: RateLimit(LimitType.COST_PER_HOUR, 5, 3600),  # $5/hour
                LimitType.COST_PER_DAY: RateLimit(LimitType.COST_PER_DAY, 50, 86400),  # $50/day
            }
        elif self.tier == "pro":
            return {
                LimitType.REQUESTS_PER_MINUTE: RateLimit(LimitType.REQUESTS_PER_MINUTE, 60, 60),
                LimitType.REQUESTS_PER_HOUR: RateLimit(LimitType.REQUESTS_PER_HOUR, 1000, 3600),
                LimitType.REQUESTS_PER_DAY: RateLimit(LimitType.REQUESTS_PER_DAY, 10000, 86400),
                LimitType.CONCURRENT_TASKS: RateLimit(LimitType.CONCURRENT_TASKS, 5, 0),
                LimitType.TOKENS_PER_MINUTE: RateLimit(LimitType.TOKENS_PER_MINUTE, 100000, 60),
                LimitType.TOKENS_PER_HOUR: RateLimit(LimitType.TOKENS_PER_HOUR, 1000000, 3600),
                LimitType.COST_PER_HOUR: RateLimit(LimitType.COST_PER_HOUR, 50, 3600),  # $50/hour
                LimitType.COST_PER_DAY: RateLimit(LimitType.COST_PER_DAY, 500, 86400),  # $500/day
            }
        else:  # enterprise
            return {
                LimitType.REQUESTS_PER_MINUTE: RateLimit(LimitType.REQUESTS_PER_MINUTE, 300, 60),
                LimitType.REQUESTS_PER_HOUR: RateLimit(LimitType.REQUESTS_PER_HOUR, 10000, 3600),
                LimitType.REQUESTS_PER_DAY: RateLimit(LimitType.REQUESTS_PER_DAY, 100000, 86400),
                LimitType.CONCURRENT_TASKS: RateLimit(LimitType.CONCURRENT_TASKS, 20, 0),
                LimitType.TOKENS_PER_MINUTE: RateLimit(LimitType.TOKENS_PER_MINUTE, 1000000, 60),
                LimitType.TOKENS_PER_HOUR: RateLimit(LimitType.TOKENS_PER_HOUR, 10000000, 3600),
                LimitType.COST_PER_HOUR: RateLimit(LimitType.COST_PER_HOUR, 1000, 3600),  # $1000/hour
                LimitType.COST_PER_DAY: RateLimit(LimitType.COST_PER_DAY, 10000, 86400),  # $10000/day
            }

class SafetyManager:
    def __init__(self):
        self.user_limits: Dict[int, UserLimits] = {}
        self.request_history: Dict[int, deque] = defaultdict(deque)
        self.token_usage: Dict[int, deque] = defaultdict(deque)
        self.cost_tracking: Dict[int, deque] = defaultdict(deque)
        self.concurrent_tasks: Dict[int, int] = defaultdict(int)
        self.blocked_users: Dict[int, datetime] = {}
        self.lock = threading.Lock()
        
        # Content safety patterns
        self.blocked_patterns = [
            # Harmful content patterns
            r'\b(hack|exploit|vulnerability|malware|virus)\b',
            r'\b(illegal|criminal|fraud|scam)\b',
            r'\b(violence|harm|attack|threat)\b',
            r'\b(personal\s+information|private\s+data|confidential)\b',
            # Add more patterns as needed
        ]
        
        # Model cost estimates (per 1K tokens)
        self.model_costs = {
            "120b": {"input": 0.01, "output": 0.03},  # $0.01 input, $0.03 output per 1K tokens
            "20b": {"input": 0.005, "output": 0.015},  # $0.005 input, $0.015 output per 1K tokens
        }
    
    def get_user_limits(self, user_id: int, tier: str = "free") -> UserLimits:
        """Get or create user limits"""
        with self.lock:
            if user_id not in self.user_limits:
                self.user_limits[user_id] = UserLimits(user_id, tier)
            return self.user_limits[user_id]
    
    def check_rate_limit(self, user_id: int, limit_type: LimitType, amount: int = 1) -> Tuple[bool, Optional[str]]:
        """Check if user is within rate limits"""
        with self.lock:
            # Check if user is blocked
            if user_id in self.blocked_users:
                if datetime.now(timezone.utc) < self.blocked_users[user_id]:
                    return False, "User is temporarily blocked due to safety violations"
                else:
                    del self.blocked_users[user_id]
            
            user_limits = self.get_user_limits(user_id)
            
            if limit_type not in user_limits.limits:
                return True, None
            
            rate_limit = user_limits.limits[limit_type]
            now = datetime.now(timezone.utc)
            
            # Reset counter if window has passed
            if rate_limit.reset_time is None or now >= rate_limit.reset_time:
                rate_limit.current_count = 0
                rate_limit.reset_time = now + timedelta(seconds=rate_limit.window_seconds)
            
            # Check if adding amount would exceed limit
            if rate_limit.current_count + amount > rate_limit.limit:
                remaining_time = (rate_limit.reset_time - now).total_seconds()
                return False, f"Rate limit exceeded. Try again in {int(remaining_time)} seconds"
            
            # Update counter
            rate_limit.current_count += amount
            return True, None
    
    def track_request(self, user_id: int, endpoint: str, tokens_used: int = 0, cost: float = 0.0):
        """Track user request for rate limiting"""
        with self.lock:
            now = time.time()
            
            # Track request history
            self.request_history[user_id].append(now)
            
            # Track token usage
            if tokens_used > 0:
                self.token_usage[user_id].append((now, tokens_used))
            
            # Track cost
            if cost > 0:
                self.cost_tracking[user_id].append((now, cost))
            
            # Clean old entries (keep last 24 hours)
            cutoff = now - 86400
            
            while self.request_history[user_id] and self.request_history[user_id][0] < cutoff:
                self.request_history[user_id].popleft()
            
            while self.token_usage[user_id] and self.token_usage[user_id][0][0] < cutoff:
                self.token_usage[user_id].popleft()
            
            while self.cost_tracking[user_id] and self.cost_tracking[user_id][0][0] < cutoff:
                self.cost_tracking[user_id].popleft()
    
    def increment_concurrent_tasks(self, user_id: int) -> Tuple[bool, Optional[str]]:
        """Increment concurrent task count"""
        allowed, message = self.check_rate_limit(user_id, LimitType.CONCURRENT_TASKS, 1)
        if allowed:
            with self.lock:
                self.concurrent_tasks[user_id] += 1
        return allowed, message
    
    def decrement_concurrent_tasks(self, user_id: int):
        """Decrement concurrent task count"""
        with self.lock:
            if user_id in self.concurrent_tasks and self.concurrent_tasks[user_id] > 0:
                self.concurrent_tasks[user_id] -= 1
    
    def estimate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Estimate cost for model usage"""
        if model not in self.model_costs:
            model = "20b"  # Default to cheaper model
        
        costs = self.model_costs[model]
        input_cost = (input_tokens / 1000) * costs["input"]
        output_cost = (output_tokens / 1000) * costs["output"]
        
        return input_cost + output_cost
    
    def check_content_safety(self, content: str) -> Tuple[bool, Optional[str]]:
        """Check content for safety violations"""
        import re
        
        content_lower = content.lower()
        
        for pattern in self.blocked_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                return False, f"Content violates safety policy: potentially harmful content detected"
        
        # Check for excessive length (potential abuse)
        if len(content) > 50000:  # 50K characters
            return False, "Content too long. Please break into smaller requests"
        
        return True, None
    
    def block_user(self, user_id: int, duration_minutes: int = 60, reason: str = "Safety violation"):
        """Temporarily block a user"""
        with self.lock:
            block_until = datetime.now(timezone.utc) + timedelta(minutes=duration_minutes)
            self.blocked_users[user_id] = block_until
            logger.warning(f"User {user_id} blocked until {block_until}: {reason}")
    
    def get_user_stats(self, user_id: int) -> Dict:
        """Get user usage statistics"""
        with self.lock:
            now = time.time()
            
            # Count requests in last hour
            hour_ago = now - 3600
            requests_last_hour = sum(1 for t in self.request_history[user_id] if t > hour_ago)
            
            # Count tokens in last hour
            tokens_last_hour = sum(tokens for t, tokens in self.token_usage[user_id] if t > hour_ago)
            
            # Calculate cost in last hour
            cost_last_hour = sum(cost for t, cost in self.cost_tracking[user_id] if t > hour_ago)
            
            user_limits = self.get_user_limits(user_id)
            
            return {
                "user_id": user_id,
                "tier": user_limits.tier,
                "requests_last_hour": requests_last_hour,
                "tokens_last_hour": tokens_last_hour,
                "cost_last_hour": round(cost_last_hour, 4),
                "concurrent_tasks": self.concurrent_tasks.get(user_id, 0),
                "is_blocked": user_id in self.blocked_users,
                "limits": {
                    limit_type.value: {
                        "limit": limit.limit,
                        "current": limit.current_count,
                        "reset_time": limit.reset_time.isoformat() if limit.reset_time else None
                    }
                    for limit_type, limit in user_limits.limits.items()
                }
            }
    
    def get_system_stats(self) -> Dict:
        """Get system-wide statistics"""
        with self.lock:
            total_users = len(self.user_limits)
            total_concurrent_tasks = sum(self.concurrent_tasks.values())
            blocked_users = len(self.blocked_users)
            
            # Calculate total requests in last hour
            now = time.time()
            hour_ago = now - 3600
            total_requests = sum(
                sum(1 for t in history if t > hour_ago)
                for history in self.request_history.values()
            )
            
            return {
                "total_users": total_users,
                "total_concurrent_tasks": total_concurrent_tasks,
                "blocked_users": blocked_users,
                "total_requests_last_hour": total_requests,
                "system_health": "healthy" if total_concurrent_tasks < 100 else "high_load"
            }

# Global safety manager instance
safety_manager = SafetyManager()

