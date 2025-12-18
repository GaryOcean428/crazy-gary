#!/usr/bin/env python3
"""
Security Configuration and Monitoring for Crazy Gary Application
Provides centralized security configuration, monitoring, and alerting
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import yaml


class SecurityLevel(Enum):
    """Security level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class SecurityConfig:
    """Security configuration data class"""
    # Rate limiting
    rate_limit_rps: int = 10
    rate_limit_burst: int = 100
    rate_limit_window: int = 60
    
    # Request validation
    max_request_size: int = 16 * 1024 * 1024  # 16MB
    max_json_depth: int = 10
    allowed_content_types: List[str] = None
    
    # Authentication
    jwt_secret_key: str = ""
    jwt_expiration_hours: int = 24
    password_min_length: int = 8
    password_require_special: bool = True
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 15
    
    # CORS settings
    cors_allowed_origins: List[str] = None
    cors_allowed_methods: List[str] = None
    cors_allowed_headers: List[str] = None
    
    # Security headers
    enable_hsts: bool = True
    enable_csp: bool = True
    enable_xss_protection: bool = True
    
    # Monitoring
    enable_security_logging: bool = True
    enable_performance_monitoring: bool = True
    log_retention_days: int = 30
    alert_webhook_url: str = ""
    
    # IP filtering
    blocked_ips: List[str] = None
    whitelist_ips: List[str] = None
    
    # Feature flags
    enable_input_sanitization: bool = True
    enable_vulnerability_scanning: bool = True
    enable_threat_detection: bool = True
    enable_audit_logging: bool = True
    
    def __post_init__(self):
        """Initialize default values for list fields"""
        if self.allowed_content_types is None:
            self.allowed_content_types = [
                'application/json',
                'application/x-www-form-urlencoded',
                'multipart/form-data',
                'text/plain'
            ]
        
        if self.cors_allowed_origins is None:
            self.cors_allowed_origins = ['*']
        
        if self.cors_allowed_methods is None:
            self.cors_allowed_methods = [
                'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'
            ]
        
        if self.cors_allowed_headers is None:
            self.cors_allowed_headers = [
                'Content-Type', 'Authorization', 'X-Requested-With',
                'X-API-Key', 'X-CSRF-Token', 'Accept', 'Accept-Language'
            ]
        
        if self.blocked_ips is None:
            self.blocked_ips = []
        
        if self.whitelist_ips is None:
            self.whitelist_ips = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SecurityConfig':
        """Create from dictionary"""
        return cls(**data)
    
    def to_yaml(self) -> str:
        """Convert to YAML string"""
        return yaml.dump(self.to_dict(), default_flow_style=False)
    
    @classmethod
    def from_yaml(cls, yaml_str: str) -> 'SecurityConfig':
        """Create from YAML string"""
        data = yaml.safe_load(yaml_str)
        return cls.from_dict(data)
    
    def save_to_file(self, filepath: str):
        """Save configuration to file"""
        with open(filepath, 'w') as f:
            f.write(self.to_yaml())
    
    @classmethod
    def load_from_file(cls, filepath: str) -> 'SecurityConfig':
        """Load configuration from file"""
        with open(filepath, 'r') as f:
            yaml_str = f.read()
        return cls.from_yaml(yaml_str)


class SecurityAlert:
    """Security alert data class"""
    
    def __init__(
        self,
        alert_type: str,
        severity: AlertSeverity,
        message: str,
        details: Dict[str, Any] = None,
        source_ip: str = None,
        user_agent: str = None,
        timestamp: datetime = None
    ):
        self.id = f"alert_{int(datetime.utcnow().timestamp() * 1000000)}"
        self.alert_type = alert_type
        self.severity = severity
        self.message = message
        self.details = details or {}
        self.source_ip = source_ip
        self.user_agent = user_agent
        self.timestamp = timestamp or datetime.utcnow()
        self.status = "active"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'severity': self.severity.value,
            'message': self.message,
            'details': self.details,
            'source_ip': self.source_ip,
            'user_agent': self.user_agent,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status
        }


class SecurityMonitor:
    """Security monitoring and alerting system"""
    
    def __init__(self, config: SecurityConfig):
        self.config = config
        self.alerts: List[SecurityAlert] = []
        self.metrics: Dict[str, Any] = {
            'requests_total': 0,
            'requests_blocked': 0,
            'auth_failures': 0,
            'rate_limit_hits': 0,
            'suspicious_requests': 0,
            'unique_ips': set(),
            'threat_score': 0,
            'start_time': datetime.utcnow()
        }
        
        # Setup logging
        self._setup_logging()
    
    def _setup_logging(self):
        """Setup security logging"""
        if not self.config.enable_security_logging:
            return
        
        # Create security logger
        self.logger = logging.getLogger('security_monitor')
        self.logger.setLevel(logging.INFO)
        
        # Create file handler
        log_file = 'security_monitor.log'
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        # Add handlers
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def record_request(
        self,
        source_ip: str,
        user_agent: str = None,
        endpoint: str = None,
        method: str = None,
        blocked: bool = False,
        suspicious: bool = False
    ):
        """Record a request for monitoring"""
        self.metrics['requests_total'] += 1
        self.metrics['unique_ips'].add(source_ip)
        
        if blocked:
            self.metrics['requests_blocked'] += 1
        
        if suspicious:
            self.metrics['suspicious_requests'] += 1
        
        # Log security events
        if self.config.enable_security_logging:
            event_data = {
                'source_ip': source_ip,
                'user_agent': user_agent,
                'endpoint': endpoint,
                'method': method,
                'blocked': blocked,
                'suspicious': suspicious
            }
            self.logger.info(f"Request recorded: {json.dumps(event_data)}")
    
    def record_auth_failure(
        self,
        source_ip: str,
        username: str = None,
        reason: str = "Authentication failed"
    ):
        """Record authentication failure"""
        self.metrics['auth_failures'] += 1
        
        # Create alert for multiple failures
        recent_failures = self._get_recent_auth_failures(source_ip)
        if recent_failures >= self.config.max_login_attempts:
            self.create_alert(
                alert_type="BRUTE_FORCE_ATTEMPT",
                severity=AlertSeverity.CRITICAL,
                message=f"Multiple authentication failures from {source_ip}",
                details={
                    'source_ip': source_ip,
                    'username': username,
                    'failure_count': recent_failures,
                    'reason': reason
                }
            )
        
        # Log the failure
        if self.config.enable_security_logging:
            self.logger.warning(
                f"Auth failure: IP={source_ip}, User={username}, Reason={reason}"
            )
    
    def record_rate_limit_hit(self, source_ip: str, endpoint: str):
        """Record rate limit hit"""
        self.metrics['rate_limit_hits'] += 1
        
        # Create alert for excessive rate limiting
        recent_hits = self._get_recent_rate_limit_hits(source_ip)
        if recent_hits >= 10:  # More than 10 hits in recent period
            self.create_alert(
                alert_type="EXCESSIVE_RATE_LIMITING",
                severity=AlertSeverity.WARNING,
                message=f"Excessive rate limiting from {source_ip}",
                details={
                    'source_ip': source_ip,
                    'endpoint': endpoint,
                    'hit_count': recent_hits
                }
            )
    
    def create_alert(
        self,
        alert_type: str,
        severity: AlertSeverity,
        message: str,
        details: Dict[str, Any] = None,
        source_ip: str = None,
        user_agent: str = None
    ):
        """Create a security alert"""
        alert = SecurityAlert(
            alert_type=alert_type,
            severity=severity,
            message=message,
            details=details,
            source_ip=source_ip,
            user_agent=user_agent
        )
        
        self.alerts.append(alert)
        
        # Log the alert
        if self.config.enable_security_logging:
            log_level = {
                AlertSeverity.INFO: logging.INFO,
                AlertSeverity.WARNING: logging.WARNING,
                AlertSeverity.ERROR: logging.ERROR,
                AlertSeverity.CRITICAL: logging.CRITICAL
            }[severity]
            
            self.logger.log(
                log_level,
                f"ALERT [{alert_type}]: {message} - {json.dumps(alert.to_dict())}"
            )
        
        # Send webhook alert if configured
        if self.config.alert_webhook_url:
            self._send_webhook_alert(alert)
    
    def _send_webhook_alert(self, alert: SecurityAlert):
        """Send alert via webhook"""
        try:
            import requests
            
            payload = {
                'alert': alert.to_dict(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            response = requests.post(
                self.config.alert_webhook_url,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info(f"Alert sent via webhook: {alert.id}")
            else:
                self.logger.error(f"Failed to send webhook alert: {response.status_code}")
        
        except Exception as e:
            self.logger.error(f"Webhook alert failed: {e}")
    
    def _get_recent_auth_failures(self, source_ip: str) -> int:
        """Get recent authentication failures for IP"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=15)
        return len([
            alert for alert in self.alerts
            if (alert.alert_type == "AUTH_FAILURE" and
                alert.source_ip == source_ip and
                alert.timestamp > cutoff_time)
        ])
    
    def _get_recent_rate_limit_hits(self, source_ip: str) -> int:
        """Get recent rate limit hits for IP"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        return len([
            alert for alert in self.alerts
            if (alert.alert_type == "RATE_LIMIT_HIT" and
                alert.source_ip == source_ip and
                alert.timestamp > cutoff_time)
        ])
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current security metrics"""
        uptime = datetime.utcnow() - self.metrics['start_time']
        
        return {
            'uptime_seconds': uptime.total_seconds(),
            'requests_total': self.metrics['requests_total'],
            'requests_blocked': self.metrics['requests_blocked'],
            'auth_failures': self.metrics['auth_failures'],
            'rate_limit_hits': self.metrics['rate_limit_hits'],
            'suspicious_requests': self.metrics['suspicious_requests'],
            'unique_ips': len(self.metrics['unique_ips']),
            'active_alerts': len([a for a in self.alerts if a.status == 'active']),
            'total_alerts': len(self.alerts),
            'threat_score': self._calculate_threat_score()
        }
    
    def _calculate_threat_score(self) -> int:
        """Calculate overall threat score"""
        score = 0
        
        # Add points for different metrics
        score += min(self.metrics['requests_blocked'] * 2, 50)
        score += min(self.metrics['auth_failures'] * 3, 30)
        score += min(self.metrics['rate_limit_hits'], 20)
        score += min(len([a for a in self.alerts if a.status == 'active']) * 5, 25)
        
        return min(score, 100)  # Cap at 100
    
    def get_security_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generate security report for specified timeframe"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # Filter alerts for timeframe
        recent_alerts = [
            alert for alert in self.alerts
            if alert.timestamp > cutoff_time
        ]
        
        # Count alert types
        alert_types = {}
        for alert in recent_alerts:
            alert_types[alert.alert_type] = alert_types.get(alert.alert_type, 0) + 1
        
        # Get top source IPs
        ip_counts = {}
        for alert in recent_alerts:
            if alert.source_ip:
                ip_counts[alert.source_ip] = ip_counts.get(alert.source_ip, 0) + 1
        
        top_ips = sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'report_period_hours': hours,
            'generated_at': datetime.utcnow().isoformat(),
            'summary': {
                'total_requests': self.metrics['requests_total'],
                'blocked_requests': self.metrics['requests_blocked'],
                'unique_ips': len(self.metrics['unique_ips']),
                'active_alerts': len([a for a in self.alerts if a.status == 'active']),
                'threat_score': self._calculate_threat_score()
            },
            'alerts': {
                'total': len(recent_alerts),
                'by_type': alert_types,
                'by_severity': {
                    severity.value: len([
                        a for a in recent_alerts if a.severity == severity
                    ]) for severity in AlertSeverity
                }
            },
            'top_source_ips': top_ips,
            'recommendations': self._generate_recommendations(recent_alerts)
        }
    
    def _generate_recommendations(self, alerts: List[SecurityAlert]) -> List[str]:
        """Generate security recommendations based on alerts"""
        recommendations = []
        
        # Analyze alert patterns
        auth_failures = len([a for a in alerts if 'AUTH' in a.alert_type])
        rate_limits = len([a for a in alerts if 'RATE_LIMIT' in a.alert_type])
        suspicious = len([a for a in alerts if 'SUSPICIOUS' in a.alert_type])
        
        if auth_failures > 10:
            recommendations.append("Consider implementing CAPTCHA after multiple auth failures")
        
        if rate_limits > 50:
            recommendations.append("Review rate limiting configuration - may be too restrictive")
        
        if suspicious > 20:
            recommendations.append("Increase monitoring for suspicious activities")
        
        if len(alerts) > 100:
            recommendations.append("High alert volume detected - review security configuration")
        
        # Default recommendations
        if not recommendations:
            recommendations.extend([
                "Continue monitoring for new threats",
                "Regularly update security rules and patterns",
                "Review and rotate API keys and secrets",
                "Monitor for unusual traffic patterns"
            ])
        
        return recommendations


class SecurityConfigManager:
    """Security configuration manager"""
    
    DEFAULT_CONFIG_PATH = "security_config.yaml"
    
    @classmethod
    def create_default_config(cls, filepath: str = None) -> SecurityConfig:
        """Create default security configuration"""
        if filepath is None:
            filepath = cls.DEFAULT_CONFIG_PATH
        
        config = SecurityConfig()
        config.save_to_file(filepath)
        return config
    
    @classmethod
    def load_config(cls, filepath: str = None) -> SecurityConfig:
        """Load security configuration"""
        if filepath is None:
            filepath = cls.DEFAULT_CONFIG_PATH
        
        try:
            return SecurityConfig.load_from_file(filepath)
        except FileNotFoundError:
            # Create default config if not found
            return cls.create_default_config(filepath)
    
    @classmethod
    def validate_config(cls, config: SecurityConfig) -> List[str]:
        """Validate security configuration"""
        issues = []
        
        # Validate rate limits
        if config.rate_limit_rps <= 0:
            issues.append("Rate limit RPS must be positive")
        
        if config.rate_limit_burst <= 0:
            issues.append("Rate limit burst must be positive")
        
        # Validate request size
        if config.max_request_size <= 0:
            issues.append("Max request size must be positive")
        
        if config.max_request_size > 100 * 1024 * 1024:  # 100MB limit
            issues.append("Max request size too large (max 100MB)")
        
        # Validate JWT settings
        if not config.jwt_secret_key:
            issues.append("JWT secret key is required")
        
        if config.jwt_expiration_hours <= 0:
            issues.append("JWT expiration hours must be positive")
        
        # Validate password policy
        if config.password_min_length < 8:
            issues.append("Password minimum length should be at least 8")
        
        if config.max_login_attempts <= 0:
            issues.append("Max login attempts must be positive")
        
        # Validate lockout duration
        if config.lockout_duration_minutes <= 0:
            issues.append("Lockout duration must be positive")
        
        return issues
    
    @classmethod
    def get_environment_config(cls) -> SecurityConfig:
        """Get configuration from environment variables"""
        config = SecurityConfig()
        
        # Map environment variables to config
        env_mappings = {
            'RATE_LIMIT_RPS': ('rate_limit_rps', int),
            'RATE_LIMIT_BURST': ('rate_limit_burst', int),
            'MAX_REQUEST_SIZE': ('max_request_size', int),
            'JWT_SECRET_KEY': ('jwt_secret_key', str),
            'JWT_EXPIRATION_HOURS': ('jwt_expiration_hours', int),
            'PASSWORD_MIN_LENGTH': ('password_min_length', int),
            'MAX_LOGIN_ATTEMPTS': ('max_login_attempts', int),
            'LOCKOUT_DURATION_MINUTES': ('lockout_duration_minutes', int),
            'ENABLE_SECURITY_LOGGING': ('enable_security_logging', lambda x: x.lower() == 'true'),
            'ENABLE_PERFORMANCE_MONITORING': ('enable_performance_monitoring', lambda x: x.lower() == 'true'),
            'ALERT_WEBHOOK_URL': ('alert_webhook_url', str),
        }
        
        for env_var, (config_attr, converter) in env_mappings.items():
            value = os.getenv(env_var)
            if value is not None:
                try:
                    setattr(config, config_attr, converter(value))
                except (ValueError, TypeError) as e:
                    logging.warning(f"Invalid value for {env_var}: {e}")
        
        return config


# Export main classes
__all__ = [
    'SecurityConfig',
    'SecurityMonitor',
    'SecurityAlert',
    'SecurityConfigManager',
    'SecurityLevel',
    'AlertSeverity'
]