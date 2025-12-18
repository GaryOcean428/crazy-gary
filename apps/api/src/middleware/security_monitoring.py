#!/usr/bin/env python3
"""
Security Monitoring and Alerting System
Implements comprehensive security monitoring, threat detection, and alerting
"""

import time
import json
import logging
import hashlib
import hmac
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from flask import request, g, jsonify, current_app
import os
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import threading
import queue
import sqlite3
from contextlib import contextmanager


class SecurityEventType(Enum):
    """Security event types"""
    AUTHENTICATION_FAILURE = "auth_failure"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SUSPICIOUS_REQUEST = "suspicious_request"
    XSS_ATTEMPT = "xss_attempt"
    SQL_INJECTION_ATTEMPT = "sql_injection"
    CSRF_VIOLATION = "csrf_violation"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    BRUTE_FORCE_ATTEMPT = "brute_force"
    MALICIOUS_FILE_UPLOAD = "malicious_upload"
    SESSION_ANOMALY = "session_anomaly"
    GEOGRAPHIC_ANOMALY = "geo_anomaly"
    API_ABUSE = "api_abuse"
    SYSTEM_INTRUSION = "intrusion"


class AlertSeverity(Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class SecurityEvent:
    """Security event data structure"""
    event_type: SecurityEventType
    severity: AlertSeverity
    ip_address: str
    user_agent: str
    path: str
    method: str
    timestamp: datetime
    details: Dict[str, Any]
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    risk_score: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary"""
        return {
            **asdict(self),
            'event_type': self.event_type.value,
            'severity': self.severity.value,
            'timestamp': self.timestamp.isoformat()
        }


class SecurityMonitor:
    """Main security monitoring class"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.alert_queue = queue.Queue()
        self.alert_handlers = []
        self.event_store = []
        self.threat_patterns = self._load_threat_patterns()
        self.rate_limiters = {}
        self.session_analyzer = SessionAnalyzer()
        self.geo_analyzer = GeographicAnalyzer()
        
        # Initialize database
        self._init_database()
        
        # Start background alert processor
        self.alert_thread = threading.Thread(target=self._process_alerts, daemon=True)
        self.alert_thread.start()
    
    def _load_threat_patterns(self) -> Dict[str, List[str]]:
        """Load threat detection patterns"""
        return {
            'sql_injection': [
                r"(\bunion\b\s+select\b)",
                r"(\bor\b\s+1=1\b)",
                r"(\bdrop\s+table\b)",
                r"(\binsert\s+into\b)",
                r"(\bdelete\s+from\b)",
                r"(\bupdate\s+set\b)",
                r"(\bcreate\s+table\b)",
                r"(\bexec\b)",
                r"(\bexecute\b)",
                r"'?\bor'?\s*'1'='1",
                r"'\s*union\s*select",
                r";\s*drop\s*",
                r"';\s*--"
            ],
            'xss': [
                r"<script[^>]*>.*?</script>",
                r"javascript:",
                r"on\w+\s*=\s*",
                r"<iframe[^>]*>",
                r"<object[^>]*>",
                r"<embed[^>]*>",
                r"<svg[^>]*>.*?</svg>",
                r"expression\s*\(",
                r"eval\s*\(",
                r"document\.cookie",
                r"document\.location"
            ],
            'path_traversal': [
                r"\.\./",
                r"\.\.\\",
                r"%2e%2e%2f",
                r"%2e%2e%5c",
                r"\.\.%2f",
                r"\.\.%5c"
            ],
            'command_injection': [
                r"[;&|`$]\s*(?:cat|ls|rm|cp|mv|chmod|chown|wget|curl|nc|netcat|telnet|ssh)",
                r"\|\s*(?:cat|ls|rm|cp|mv|chmod|chown|wget|curl|nc|netcat|telnet|ssh)",
                r"&\s*(?:cat|ls|rm|cp|mv|chmod|chown|wget|curl|nc|netcat|telnet|ssh)",
                r"whoami",
                r"id",
                r"uname",
                r"ps\s+aux"
            ]
        }
    
    def _init_database(self):
        """Initialize security event database"""
        db_path = self.config.get('database_path', 'security_events.db')
        
        with sqlite3.connect(db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS security_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    ip_address TEXT NOT NULL,
                    user_agent TEXT,
                    path TEXT NOT NULL,
                    method TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    details TEXT,
                    user_id TEXT,
                    session_id TEXT,
                    risk_score INTEGER DEFAULT 0
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp ON security_events(timestamp)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_ip ON security_events(ip_address)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_event_type ON security_events(event_type)
            """)
    
    def log_security_event(self, event: SecurityEvent):
        """Log security event"""
        # Store in memory
        self.event_store.append(event)
        
        # Store in database
        self._store_event_db(event)
        
        # Add to alert queue if high severity
        if event.severity in [AlertSeverity.HIGH, AlertSeverity.CRITICAL]:
            self.alert_queue.put(event)
        
        # Analyze for patterns
        self._analyze_event_patterns(event)
    
    def _store_event_db(self, event: SecurityEvent):
        """Store event in database"""
        db_path = self.config.get('database_path', 'security_events.db')
        
        try:
            with sqlite3.connect(db_path) as conn:
                conn.execute("""
                    INSERT INTO security_events 
                    (event_type, severity, ip_address, user_agent, path, method, 
                     timestamp, details, user_id, session_id, risk_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event.event_type.value,
                    event.severity.value,
                    event.ip_address,
                    event.user_agent,
                    event.path,
                    event.method,
                    event.timestamp.isoformat(),
                    json.dumps(event.details),
                    event.user_id,
                    event.session_id,
                    event.risk_score
                ))
        except Exception as e:
            logging.error(f"Failed to store security event: {e}")
    
    def _analyze_event_patterns(self, event: SecurityEvent):
        """Analyze event for threat patterns"""
        # Check for rapid-fire requests
        self._check_request_frequency(event.ip_address)
        
        # Check for geographic anomalies
        self.geo_analyzer.check_anomaly(event)
        
        # Check for session anomalies
        self.session_analyzer.check_anomaly(event)
    
    def _check_request_frequency(self, ip_address: str):
        """Check for rapid-fire requests from IP"""
        current_time = time.time()
        window_start = current_time - 300  # 5 minutes
        
        # Count requests in last 5 minutes
        recent_events = [
            e for e in self.event_store
            if e.ip_address == ip_address and 
            (current_time - e.timestamp.timestamp()) <= 300
        ]
        
        if len(recent_events) > 100:  # More than 100 requests in 5 minutes
            self.log_security_event(SecurityEvent(
                event_type=SecurityEventType.API_ABUSE,
                severity=AlertSeverity.HIGH,
                ip_address=ip_address,
                user_agent="",
                path="",
                method="",
                timestamp=datetime.now(),
                details={'request_count': len(recent_events), 'window': '5m'},
                risk_score=80
            ))
    
    def detect_sql_injection(self, data: str) -> bool:
        """Detect SQL injection attempts"""
        if not data:
            return False
        
        data_lower = data.lower()
        for pattern in self.threat_patterns['sql_injection']:
            if re.search(pattern, data_lower, re.IGNORECASE):
                return True
        
        return False
    
    def detect_xss_attempt(self, data: str) -> bool:
        """Detect XSS attempts"""
        if not data:
            return False
        
        for pattern in self.threat_patterns['xss']:
            if re.search(pattern, data, re.IGNORECASE):
                return True
        
        return False
    
    def detect_path_traversal(self, data: str) -> bool:
        """Detect path traversal attempts"""
        if not data:
            return False
        
        for pattern in self.threat_patterns['path_traversal']:
            if re.search(pattern, data, re.IGNORECASE):
                return True
        
        return False
    
    def detect_command_injection(self, data: str) -> bool:
        """Detect command injection attempts"""
        if not data:
            return False
        
        for pattern in self.threat_patterns['command_injection']:
            if re.search(pattern, data, re.IGNORECASE):
                return True
        
        return False
    
    def analyze_request(self, request_data: Dict[str, Any]) -> List[SecurityEvent]:
        """Analyze request for security threats"""
        events = []
        ip_address = request_data.get('ip_address', 'unknown')
        user_agent = request_data.get('user_agent', '')
        path = request_data.get('path', '')
        method = request_data.get('method', '')
        
        # Check query parameters
        query_params = request_data.get('query_params', {})
        for key, value in query_params.items():
            if isinstance(value, str):
                if self.detect_sql_injection(value):
                    events.append(SecurityEvent(
                        event_type=SecurityEventType.SQL_INJECTION_ATTEMPT,
                        severity=AlertSeverity.HIGH,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        path=path,
                        method=method,
                        timestamp=datetime.now(),
                        details={'parameter': key, 'value': value[:100]},  # Truncate for logging
                        risk_score=90
                    ))
                
                if self.detect_xss_attempt(value):
                    events.append(SecurityEvent(
                        event_type=SecurityEventType.XSS_ATTEMPT,
                        severity=AlertSeverity.HIGH,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        path=path,
                        method=method,
                        timestamp=datetime.now(),
                        details={'parameter': key, 'value': value[:100]},
                        risk_score=85
                    ))
                
                if self.detect_path_traversal(value):
                    events.append(SecurityEvent(
                        event_type=SecurityEventType.SUSPICIOUS_REQUEST,
                        severity=AlertSeverity.MEDIUM,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        path=path,
                        method=method,
                        timestamp=datetime.now(),
                        details={'parameter': key, 'value': value[:100], 'attack_type': 'path_traversal'},
                        risk_score=70
                    ))
        
        # Check form data
        form_data = request_data.get('form_data', {})
        for key, value in form_data.items():
            if isinstance(value, str):
                if self.detect_sql_injection(value):
                    events.append(SecurityEvent(
                        event_type=SecurityEventType.SQL_INJECTION_ATTEMPT,
                        severity=AlertSeverity.HIGH,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        path=path,
                        method=method,
                        timestamp=datetime.now(),
                        details={'parameter': key, 'value': value[:100]},
                        risk_score=90
                    ))
        
        # Check JSON data
        json_data = request_data.get('json_data', {})
        if isinstance(json_data, dict):
            json_str = json.dumps(json_data)
            if self.detect_sql_injection(json_str):
                events.append(SecurityEvent(
                    event_type=SecurityEventType.SQL_INJECTION_ATTEMPT,
                    severity=AlertSeverity.HIGH,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    path=path,
                    method=method,
                    timestamp=datetime.now(),
                    details={'attack_type': 'json_sql_injection', 'data_size': len(json_str)},
                    risk_score=90
                ))
        
        return events
    
    def _process_alerts(self):
        """Process alert queue in background thread"""
        while True:
            try:
                event = self.alert_queue.get(timeout=30)
                self._send_alert(event)
                self.alert_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logging.error(f"Error processing alert: {e}")
    
    def _send_alert(self, event: SecurityEvent):
        """Send security alert"""
        for handler in self.alert_handlers:
            try:
                handler(event)
            except Exception as e:
                logging.error(f"Alert handler failed: {e}")
    
    def add_alert_handler(self, handler: Callable[[SecurityEvent], None]):
        """Add alert handler"""
        self.alert_handlers.append(handler)
    
    def get_recent_events(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent security events"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        db_path = self.config.get('database_path', 'security_events.db')
        
        try:
            with sqlite3.connect(db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT * FROM security_events 
                    WHERE timestamp > ? 
                    ORDER BY timestamp DESC
                    LIMIT 1000
                """, (cutoff_time.isoformat(),))
                
                events = []
                for row in cursor:
                    events.append(dict(row))
                
                return events
        except Exception as e:
            logging.error(f"Failed to retrieve security events: {e}")
            return []
    
    def get_event_statistics(self, hours: int = 24) -> Dict[str, Any]:
        """Get security event statistics"""
        recent_events = self.get_recent_events(hours)
        
        stats = {
            'total_events': len(recent_events),
            'events_by_type': {},
            'events_by_severity': {},
            'top_ips': {},
            'top_paths': {},
            'time_range_hours': hours
        }
        
        for event in recent_events:
            # Count by type
            event_type = event['event_type']
            stats['events_by_type'][event_type] = stats['events_by_type'].get(event_type, 0) + 1
            
            # Count by severity
            severity = event['severity']
            stats['events_by_severity'][severity] = stats['events_by_severity'].get(severity, 0) + 1
            
            # Count top IPs
            ip = event['ip_address']
            stats['top_ips'][ip] = stats['top_ips'].get(ip, 0) + 1
            
            # Count top paths
            path = event['path']
            stats['top_paths'][path] = stats['top_paths'].get(path, 0) + 1
        
        # Sort and limit results
        stats['top_ips'] = dict(sorted(stats['top_ips'].items(), key=lambda x: x[1], reverse=True)[:10])
        stats['top_paths'] = dict(sorted(stats['top_paths'].items(), key=lambda x: x[1], reverse=True)[:10])
        
        return stats


class SessionAnalyzer:
    """Analyze session patterns for anomalies"""
    
    def __init__(self):
        self.session_patterns = {}
    
    def check_anomaly(self, event: SecurityEvent):
        """Check for session anomalies"""
        if not event.session_id:
            return
        
        session_id = event.session_id
        
        if session_id not in self.session_patterns:
            self.session_patterns[session_id] = {
                'first_seen': event.timestamp,
                'last_seen': event.timestamp,
                'ip_addresses': {event.ip_address},
                'user_agents': {event.user_agent},
                'paths': set(),
                'request_count': 1
            }
        
        pattern = self.session_patterns[session_id]
        pattern['last_seen'] = event.timestamp
        pattern['ip_addresses'].add(event.ip_address)
        pattern['user_agents'].add(event.user_agent)
        pattern['paths'].add(event.path)
        pattern['request_count'] += 1
        
        # Check for anomalies
        if len(pattern['ip_addresses']) > 3:
            # Multiple IP addresses for same session
            event.risk_score = max(event.risk_score, 60)
        
        if len(pattern['user_agents']) > 2:
            # Multiple user agents for same session
            event.risk_score = max(event.risk_score, 40)
        
        # Check for rapid requests
        session_duration = (event.timestamp - pattern['first_seen']).total_seconds()
        if session_duration < 300 and pattern['request_count'] > 50:  # 50 requests in 5 minutes
            event.risk_score = max(event.risk_score, 70)


class GeographicAnalyzer:
    """Analyze geographic patterns for anomalies"""
    
    def __init__(self):
        # This would typically use a GeoIP database
        self.known_locations = {}
    
    def check_anomaly(self, event: SecurityEvent):
        """Check for geographic anomalies"""
        # Placeholder implementation
        # In production, use GeoIP database to check IP location
        
        if event.ip_address in self.known_locations:
            # Check if IP location changed significantly
            # This is a simplified check
            pass


# Alert handlers
def email_alert_handler(config: Dict[str, Any]):
    """Email alert handler"""
    def handler(event: SecurityEvent):
        try:
            smtp_server = config.get('smtp_server')
            smtp_port = config.get('smtp_port', 587)
            username = config.get('smtp_username')
            password = config.get('smtp_password')
            to_email = config.get('alert_email')
            
            if not all([smtp_server, username, password, to_email]):
                return
            
            # Create email
            msg = MimeMultipart()
            msg['From'] = username
            msg['To'] = to_email
            msg['Subject'] = f"Security Alert: {event.severity.value.upper()} - {event.event_type.value}"
            
            body = f"""
Security Alert Details:

Event Type: {event.event_type.value}
Severity: {event.severity.value}
Timestamp: {event.timestamp.isoformat()}
IP Address: {event.ip_address}
User Agent: {event.user_agent}
Path: {event.path}
Method: {event.method}
Risk Score: {event.risk_score}

Details:
{json.dumps(event.details, indent=2)}

Please investigate this security event immediately.
            """
            
            msg.attach(MimeText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(username, password)
            server.send_message(msg)
            server.quit()
            
        except Exception as e:
            logging.error(f"Failed to send email alert: {e}")
    
    return handler


def webhook_alert_handler(config: Dict[str, Any]):
    """Webhook alert handler"""
    def handler(event: SecurityEvent):
        try:
            webhook_url = config.get('webhook_url')
            if not webhook_url:
                return
            
            import requests
            
            payload = {
                'event': event.to_dict(),
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code != 200:
                logging.error(f"Webhook alert failed: {response.status_code}")
                
        except Exception as e:
            logging.error(f"Failed to send webhook alert: {e}")
    
    return handler


# Flask integration
def setup_security_monitoring(app, config: Optional[Dict[str, Any]] = None):
    """Setup security monitoring for Flask app"""
    config = config or {}
    
    # Initialize security monitor
    monitor = SecurityMonitor(config)
    
    # Add alert handlers
    if 'email' in config:
        monitor.add_alert_handler(email_alert_handler(config['email']))
    
    if 'webhook' in config:
        monitor.add_alert_handler(webhook_alert_handler(config['webhook']))
    
    # Add to app context
    g.security_monitor = monitor
    
    @app.before_request
    def security_monitoring():
        """Monitor all requests for security threats"""
        request_data = {
            'ip_address': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
            'user_agent': request.headers.get('User-Agent', ''),
            'path': request.path,
            'method': request.method,
            'query_params': dict(request.args),
            'form_data': dict(request.form) if request.form else {},
            'json_data': request.get_json() if request.is_json else {}
        }
        
        # Analyze request for threats
        threats = monitor.analyze_request(request_data)
        
        # Log threats
        for threat in threats:
            monitor.log_security_event(threat)
    
    # Add monitoring endpoints
    @app.route('/api/security/events', methods=['GET'])
    def get_security_events():
        """Get recent security events"""
        hours = request.args.get('hours', 24, type=int)
        events = monitor.get_recent_events(hours)
        return jsonify({'events': events})
    
    @app.route('/api/security/stats', methods=['GET'])
    def get_security_stats():
        """Get security statistics"""
        hours = request.args.get('hours', 24, type=int)
        stats = monitor.get_event_statistics(hours)
        return jsonify(stats)


# Utility functions
def create_security_event(
    event_type: str,
    severity: str,
    details: Dict[str, Any]
) -> SecurityEvent:
    """Create security event from components"""
    return SecurityEvent(
        event_type=SecurityEventType(event_type),
        severity=AlertSeverity(severity),
        ip_address=request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
        user_agent=request.headers.get('User-Agent', ''),
        path=request.path,
        method=request.method,
        timestamp=datetime.now(),
        details=details
    )