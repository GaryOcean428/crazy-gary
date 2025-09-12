"""
Observability and Monitoring
Implements logging, metrics, health checks, and monitoring
"""
import time
import logging
import psutil
import threading
from datetime import datetime, timedelta
from collections import defaultdict, deque
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('crazy_gary.log')
    ]
)

logger = logging.getLogger(__name__)

class MetricType(Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"

class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

@dataclass
class Metric:
    name: str
    type: MetricType
    value: float
    timestamp: datetime
    labels: Dict[str, str] = None
    
    def to_dict(self):
        return {
            "name": self.name,
            "type": self.type.value,
            "value": self.value,
            "timestamp": self.timestamp.isoformat(),
            "labels": self.labels or {}
        }

@dataclass
class HealthCheck:
    name: str
    status: HealthStatus
    message: str
    timestamp: datetime
    response_time_ms: float = 0.0
    
    def to_dict(self):
        return {
            "name": self.name,
            "status": self.status.value,
            "message": self.message,
            "timestamp": self.timestamp.isoformat(),
            "response_time_ms": self.response_time_ms
        }

class ObservabilityManager:
    def __init__(self):
        self.metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.health_checks: Dict[str, HealthCheck] = {}
        self.request_logs: deque = deque(maxlen=10000)
        self.error_logs: deque = deque(maxlen=1000)
        self.performance_logs: deque = deque(maxlen=1000)
        self.lock = threading.Lock()
        
        # Start background monitoring
        self.monitoring_thread = threading.Thread(target=self._background_monitoring, daemon=True)
        self.monitoring_thread.start()
    
    def record_metric(self, name: str, value: float, metric_type: MetricType = MetricType.GAUGE, labels: Dict[str, str] = None):
        """Record a metric"""
        with self.lock:
            metric = Metric(
                name=name,
                type=metric_type,
                value=value,
                timestamp=datetime.utcnow(),
                labels=labels
            )
            self.metrics[name].append(metric)
    
    def increment_counter(self, name: str, value: float = 1.0, labels: Dict[str, str] = None):
        """Increment a counter metric"""
        self.record_metric(name, value, MetricType.COUNTER, labels)
    
    def set_gauge(self, name: str, value: float, labels: Dict[str, str] = None):
        """Set a gauge metric"""
        self.record_metric(name, value, MetricType.GAUGE, labels)
    
    def record_timer(self, name: str, duration_ms: float, labels: Dict[str, str] = None):
        """Record a timer metric"""
        self.record_metric(name, duration_ms, MetricType.TIMER, labels)
    
    def log_request(self, method: str, path: str, status_code: int, duration_ms: float, user_id: Optional[int] = None):
        """Log an HTTP request"""
        with self.lock:
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "method": method,
                "path": path,
                "status_code": status_code,
                "duration_ms": duration_ms,
                "user_id": user_id
            }
            self.request_logs.append(log_entry)
            
            # Record metrics
            self.increment_counter("http_requests_total", labels={"method": method, "status": str(status_code)})
            self.record_timer("http_request_duration", duration_ms, labels={"method": method, "path": path})
    
    def log_error(self, error_type: str, message: str, stack_trace: str = None, user_id: Optional[int] = None):
        """Log an error"""
        with self.lock:
            error_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "error_type": error_type,
                "message": message,
                "stack_trace": stack_trace,
                "user_id": user_id
            }
            self.error_logs.append(error_entry)
            
            # Record metric
            self.increment_counter("errors_total", labels={"type": error_type})
            
            # Log to standard logger
            logger.error(f"{error_type}: {message}", exc_info=stack_trace is not None)
    
    def log_performance(self, operation: str, duration_ms: float, metadata: Dict[str, Any] = None):
        """Log performance data"""
        with self.lock:
            perf_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "operation": operation,
                "duration_ms": duration_ms,
                "metadata": metadata or {}
            }
            self.performance_logs.append(perf_entry)
            
            # Record metric
            self.record_timer("operation_duration", duration_ms, labels={"operation": operation})
    
    def register_health_check(self, name: str, check_function):
        """Register a health check function"""
        def run_check():
            start_time = time.time()
            try:
                result = check_function()
                duration_ms = (time.time() - start_time) * 1000
                
                if isinstance(result, bool):
                    status = HealthStatus.HEALTHY if result else HealthStatus.UNHEALTHY
                    message = "OK" if result else "Check failed"
                elif isinstance(result, dict):
                    status = HealthStatus(result.get("status", "healthy"))
                    message = result.get("message", "OK")
                else:
                    status = HealthStatus.HEALTHY
                    message = str(result)
                
                health_check = HealthCheck(
                    name=name,
                    status=status,
                    message=message,
                    timestamp=datetime.utcnow(),
                    response_time_ms=duration_ms
                )
                
                with self.lock:
                    self.health_checks[name] = health_check
                
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                health_check = HealthCheck(
                    name=name,
                    status=HealthStatus.UNHEALTHY,
                    message=f"Health check failed: {str(e)}",
                    timestamp=datetime.utcnow(),
                    response_time_ms=duration_ms
                )
                
                with self.lock:
                    self.health_checks[name] = health_check
                
                self.log_error("health_check_error", f"Health check {name} failed: {str(e)}")
        
        # Run initial check
        run_check()
        return run_check
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health"""
        with self.lock:
            # Get system metrics
            cpu_percent = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Determine overall status
            unhealthy_checks = [check for check in self.health_checks.values() if check.status == HealthStatus.UNHEALTHY]
            degraded_checks = [check for check in self.health_checks.values() if check.status == HealthStatus.DEGRADED]
            
            if unhealthy_checks:
                overall_status = HealthStatus.UNHEALTHY
            elif degraded_checks or cpu_percent > 90 or memory.percent > 90:
                overall_status = HealthStatus.DEGRADED
            else:
                overall_status = HealthStatus.HEALTHY
            
            return {
                "status": overall_status.value,
                "timestamp": datetime.utcnow().isoformat(),
                "system": {
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "disk_percent": disk.percent,
                    "uptime_seconds": time.time() - psutil.boot_time()
                },
                "health_checks": {name: check.to_dict() for name, check in self.health_checks.items()},
                "summary": {
                    "total_checks": len(self.health_checks),
                    "healthy_checks": len([c for c in self.health_checks.values() if c.status == HealthStatus.HEALTHY]),
                    "degraded_checks": len(degraded_checks),
                    "unhealthy_checks": len(unhealthy_checks)
                }
            }
    
    def get_metrics(self, name: Optional[str] = None, limit: int = 100) -> Dict[str, List[Dict]]:
        """Get metrics data"""
        with self.lock:
            if name:
                if name in self.metrics:
                    return {name: [metric.to_dict() for metric in list(self.metrics[name])[-limit:]]}
                else:
                    return {}
            else:
                return {
                    metric_name: [metric.to_dict() for metric in list(metric_list)[-limit:]]
                    for metric_name, metric_list in self.metrics.items()
                }
    
    def get_request_logs(self, limit: int = 100) -> List[Dict]:
        """Get recent request logs"""
        with self.lock:
            return list(self.request_logs)[-limit:]
    
    def get_error_logs(self, limit: int = 100) -> List[Dict]:
        """Get recent error logs"""
        with self.lock:
            return list(self.error_logs)[-limit:]
    
    def get_performance_logs(self, limit: int = 100) -> List[Dict]:
        """Get recent performance logs"""
        with self.lock:
            return list(self.performance_logs)[-limit:]
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive dashboard data"""
        now = datetime.utcnow()
        hour_ago = now - timedelta(hours=1)
        
        with self.lock:
            # Count recent requests
            recent_requests = [log for log in self.request_logs if datetime.fromisoformat(log["timestamp"]) > hour_ago]
            
            # Count recent errors
            recent_errors = [log for log in self.error_logs if datetime.fromisoformat(log["timestamp"]) > hour_ago]
            
            # Calculate average response time
            if recent_requests:
                avg_response_time = sum(log["duration_ms"] for log in recent_requests) / len(recent_requests)
            else:
                avg_response_time = 0
            
            # Get latest metrics
            latest_metrics = {}
            for name, metric_list in self.metrics.items():
                if metric_list:
                    latest_metrics[name] = metric_list[-1].value
            
            return {
                "timestamp": now.isoformat(),
                "health": self.get_system_health(),
                "stats": {
                    "requests_last_hour": len(recent_requests),
                    "errors_last_hour": len(recent_errors),
                    "avg_response_time_ms": round(avg_response_time, 2),
                    "error_rate": round(len(recent_errors) / max(len(recent_requests), 1) * 100, 2)
                },
                "metrics": latest_metrics
            }
    
    def _background_monitoring(self):
        """Background thread for system monitoring"""
        while True:
            try:
                # Record system metrics
                self.set_gauge("system_cpu_percent", psutil.cpu_percent())
                self.set_gauge("system_memory_percent", psutil.virtual_memory().percent)
                self.set_gauge("system_disk_percent", psutil.disk_usage('/').percent)
                
                # Run health checks
                for name, check in list(self.health_checks.items()):
                    # Health checks are updated when registered functions are called
                    pass
                
                time.sleep(30)  # Run every 30 seconds
                
            except Exception as e:
                logger.error(f"Background monitoring error: {str(e)}")
                time.sleep(60)  # Wait longer on error

# Global observability manager instance
observability_manager = ObservabilityManager()

# Decorator for timing functions
def timed_operation(operation_name: str):
    """Decorator to time function execution"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                observability_manager.log_performance(operation_name, duration_ms)
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                observability_manager.log_performance(operation_name, duration_ms, {"error": str(e)})
                observability_manager.log_error("operation_error", f"{operation_name} failed: {str(e)}")
                raise
        return wrapper
    return decorator

