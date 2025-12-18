"""
Comprehensive Monitoring Models
Enhanced monitoring and alerting system models
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import json
import psutil
import asyncio
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, JSON
from src.models.user import db

class AlertSeverity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AlertStatus(Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"

class IncidentStatus(Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"

@dataclass
class MetricPoint:
    """Individual metric data point"""
    timestamp: datetime
    value: float
    tags: Dict[str, str]
    metadata: Dict[str, Any]

@dataclass
class Alert:
    """Alert data structure"""
    id: str
    title: str
    description: str
    severity: AlertSeverity
    status: AlertStatus
    source: str
    metric_name: str
    threshold: float
    current_value: float
    created_at: datetime
    updated_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_by: Optional[str] = None
    tags: List[str] = None
    metadata: Dict[str, Any] = None

class MonitoringMetric(db.Model):
    """Store monitoring metrics"""
    __tablename__ = 'monitoring_metrics'
    
    id = Column(Integer, primary_key=True)
    metric_name = Column(String(255), nullable=False, index=True)
    metric_type = Column(String(100), nullable=False)  # counter, gauge, histogram
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    tags = Column(JSON)  # Store as JSON
    source = Column(String(255))  # Which service/component generated this metric
    metadata = Column(JSON)  # Additional metadata
    
    def __init__(self, metric_name: str, metric_type: str, value: float, 
                 timestamp: datetime, tags: Dict = None, source: str = None, metadata: Dict = None):
        self.metric_name = metric_name
        self.metric_type = metric_type
        self.value = value
        self.timestamp = timestamp
        self.tags = tags or {}
        self.source = source or 'system'
        self.metadata = metadata or {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'metric_name': self.metric_name,
            'metric_type': self.metric_type,
            'value': self.value,
            'timestamp': self.timestamp.isoformat(),
            'tags': self.tags,
            'source': self.source,
            'metadata': self.metadata
        }

class SystemAlert(db.Model):
    """Store system alerts"""
    __tablename__ = 'system_alerts'
    
    id = Column(String(255), primary_key=True)  # UUID or custom ID
    title = Column(String(500), nullable=False)
    description = Column(Text)
    severity = Column(String(20), nullable=False)  # critical, high, medium, low, info
    status = Column(String(20), nullable=False, default='active')  # active, acknowledged, resolved, suppressed
    source = Column(String(255), nullable=False)
    metric_name = Column(String(255))
    threshold = Column(Float)
    current_value = Column(Float)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    acknowledged_at = Column(DateTime)
    resolved_at = Column(DateTime)
    acknowledged_by = Column(String(255))
    resolved_by = Column(String(255))
    tags = Column(JSON)  # Store as list of strings
    metadata = Column(JSON)  # Store as JSON
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'source': self.source,
            'metric_name': self.metric_name,
            'threshold': self.threshold,
            'current_value': self.current_value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'acknowledged_at': self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'acknowledged_by': self.acknowledged_by,
            'resolved_by': self.resolved_by,
            'tags': self.tags,
            'metadata': self.metadata
        }

class Incident(db.Model):
    """Store incident management data"""
    __tablename__ = 'incidents'
    
    id = Column(String(255), primary_key=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    status = Column(String(20), nullable=False, default='open')
    severity = Column(String(20), nullable=False)
    priority = Column(String(20), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    created_by = Column(String(255))
    assigned_to = Column(String(255))
    related_alerts = Column(JSON)  # List of alert IDs
    affected_services = Column(JSON)  # List of affected service names
    timeline = Column(JSON)  # Incident timeline with events
    root_cause = Column(Text)
    resolution = Column(Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'severity': self.severity,
            'priority': self.priority,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_by': self.created_by,
            'assigned_to': self.assigned_to,
            'related_alerts': self.related_alerts,
            'affected_services': self.affected_services,
            'timeline': self.timeline,
            'root_cause': self.root_cause,
            'resolution': self.resolution
        }

class HealthCheck(db.Model):
    """Store health check results"""
    __tablename__ = 'health_checks'
    
    id = Column(Integer, primary_key=True)
    service_name = Column(String(255), nullable=False, index=True)
    check_type = Column(String(100), nullable=False)  # endpoint, database, external_api, custom
    status = Column(String(20), nullable=False)  # healthy, degraded, unhealthy, unknown
    response_time = Column(Float)  # milliseconds
    status_code = Column(Integer)
    error_message = Column(Text)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    metadata = Column(JSON)
    
    def to_dict(self):
        return {
            'id': self.id,
            'service_name': self.service_name,
            'check_type': self.check_type,
            'status': self.status,
            'response_time': self.response_time,
            'status_code': self.status_code,
            'error_message': self.error_message,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.metadata
        }

class SLAMetric(db.Model):
    """Store SLA monitoring metrics"""
    __tablename__ = 'sla_metrics'
    
    id = Column(Integer, primary_key=True)
    service_name = Column(String(255), nullable=False, index=True)
    metric_type = Column(String(100), nullable=False)  # availability, performance, quality
    target_value = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=False)
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False, index=True)
    met_sla = Column(Boolean, default=False)
    violations = Column(Integer, default=0)
    metadata = Column(JSON)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'service_name': self.service_name,
            'metric_type': self.metric_type,
            'target_value': self.target_value,
            'actual_value': self.actual_value,
            'period_start': self.period_start.isoformat(),
            'period_end': self.period_end.isoformat(),
            'met_sla': self.met_sla,
            'violations': self.violations,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat()
        }

class LogEntry(db.Model):
    """Store log entries for analysis"""
    __tablename__ = 'log_entries'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    level = Column(String(20), nullable=False)  # DEBUG, INFO, WARN, ERROR, CRITICAL
    source = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    service = Column(String(255))
    user_id = Column(String(255))
    request_id = Column(String(255))
    session_id = Column(String(255))
    stack_trace = Column(Text)
    metadata = Column(JSON)
    indexed_fields = Column(JSON)  # For search optimization
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'level': self.level,
            'source': self.source,
            'message': self.message,
            'service': self.service,
            'user_id': self.user_id,
            'request_id': self.request_id,
            'session_id': self.session_id,
            'stack_trace': self.stack_trace,
            'metadata': self.metadata,
            'indexed_fields': self.indexed_fields
        }

class SyntheticCheck(db.Model):
    """Store synthetic monitoring checks"""
    __tablename__ = 'synthetic_checks'
    
    id = Column(String(255), primary_key=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False)
    check_type = Column(String(50), nullable=False)  # http, https, ping, tcp
    frequency = Column(Integer, nullable=False)  # seconds between checks
    timeout = Column(Integer, default=30)  # seconds
    expected_status = Column(Integer)
    expected_content = Column(String(500))
    headers = Column(JSON)
    authentication = Column(JSON)
    status = Column(String(20), default='active')
    last_run = Column(DateTime)
    next_run = Column(DateTime)
    success_rate = Column(Float, default=100.0)
    avg_response_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'url': self.url,
            'check_type': self.check_type,
            'frequency': self.frequency,
            'timeout': self.timeout,
            'expected_status': self.expected_status,
            'expected_content': self.expected_content,
            'headers': self.headers,
            'authentication': self.authentication,
            'status': self.status,
            'last_run': self.last_run.isoformat() if self.last_run else None,
            'next_run': self.next_run.isoformat() if self.next_run else None,
            'success_rate': self.success_rate,
            'avg_response_time': self.avg_response_time,
            'created_at': self.created_at.isoformat(),
            'created_by': self.created_by
        }

class SyntheticResult(db.Model):
    """Store synthetic monitoring results"""
    __tablename__ = 'synthetic_results'
    
    id = Column(Integer, primary_key=True)
    check_id = Column(String(255), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    status = Column(String(20), nullable=False)  # success, failure, timeout, error
    response_time = Column(Float)  # milliseconds
    status_code = Column(Integer)
    error_message = Column(Text)
    content_checks = Column(JSON)  # Results of content checks
    performance_metrics = Column(JSON)  # Detailed performance data
    screenshot_path = Column(String(500))  # Path to screenshot if taken
    
    def to_dict(self):
        return {
            'id': self.id,
            'check_id': self.check_id,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status,
            'response_time': self.response_time,
            'status_code': self.status_code,
            'error_message': self.error_message,
            'content_checks': self.content_checks,
            'performance_metrics': self.performance_metrics,
            'screenshot_path': self.screenshot_path
        }

class AlertRule(db.Model):
    """Store alert rules and thresholds"""
    __tablename__ = 'alert_rules'
    
    id = Column(String(255), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    metric_name = Column(String(255), nullable=False)
    condition = Column(String(50), nullable=False)  # greater_than, less_than, equals, not_equals
    threshold = Column(Float, nullable=False)
    duration = Column(Integer, default=300)  # seconds the condition must persist
    severity = Column(String(20), nullable=False)
    enabled = Column(Boolean, default=True)
    tags = Column(JSON)
    notification_channels = Column(JSON)  # List of notification methods
    escalation_rules = Column(JSON)
    suppression_rules = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'metric_name': self.metric_name,
            'condition': self.condition,
            'threshold': self.threshold,
            'duration': self.duration,
            'severity': self.severity,
            'enabled': self.enabled,
            'tags': self.tags,
            'notification_channels': self.notification_channels,
            'escalation_rules': self.escalation_rules,
            'suppression_rules': self.suppression_rules,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'created_by': self.created_by
        }