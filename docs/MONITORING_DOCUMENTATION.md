# Comprehensive Monitoring and Alerting System

## Overview

This document provides comprehensive documentation for the monitoring and alerting system implemented for the Crazy Gary application. The system provides real-time monitoring, alerting, incident management, and observability across all application components.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Components](#components)
3. [Installation and Setup](#installation-and-setup)
4. [Monitoring Dashboard](#monitoring-dashboard)
5. [Alert Management](#alert-management)
6. [Incident Management](#incident-management)
7. [Infrastructure Monitoring](#infrastructure-monitoring)
8. [Synthetic Monitoring](#synthetic-monitoring)
9. [SLA Monitoring](#sla-monitoring)
10. [Log Management](#log-management)
11. [API Reference](#api-reference)
12. [Runbooks](#runbooks)
13. [Troubleshooting](#troubleshooting)

## System Architecture

The monitoring system consists of several interconnected components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │  Monitoring     │
│   Dashboard     │◄──►│   & Services     │◄──►│  Services       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Database       │    │  External       │
                       │   (Metrics &     │    │  Integrations   │
                       │    Logs)         │    │  (Sentry, etc.) │
                       └──────────────────┘    └─────────────────┘
```

### Key Components

1. **Monitoring Dashboard** - React-based web interface
2. **Monitoring Service** - Core business logic for alerts and metrics
3. **Infrastructure Monitor** - System-level monitoring (CPU, memory, disk)
4. **Synthetic Monitor** - External monitoring and user journey testing
5. **Database Models** - SQLAlchemy models for data persistence
6. **API Routes** - REST endpoints for all monitoring operations
7. **WebSocket Handlers** - Real-time updates and notifications

## Components

### 1. Monitoring Dashboard

**Location:** `/workspace/crazy-gary/apps/web/src/pages/monitoring/`

**Features:**
- Real-time system health overview
- Performance metrics visualization
- Infrastructure monitoring
- Alert management interface
- Incident tracking
- Log analysis
- SLA reporting
- Configuration management

**Usage:**
Access the dashboard at `/monitoring` when the application is running.

### 2. Monitoring Service

**Location:** `/workspace/crazy-gary/apps/api/src/services/monitoring_service.py`

**Responsibilities:**
- Alert creation and management
- Metric collection and storage
- Incident management
- Health check execution
- SLA calculation
- Log aggregation

**Key Classes:**
- `MonitoringService` - Main monitoring orchestration
- `Alert` - Alert data structure
- `Incident` - Incident management

### 3. Infrastructure Monitor

**Location:** `/workspace/crazy-gary/apps/api/src/services/infrastructure_monitor.py`

**Responsibilities:**
- CPU, memory, disk monitoring
- Process monitoring
- Network monitoring
- System health checks
- Performance baseline establishment

**Key Metrics:**
- CPU usage percentage
- Memory usage and availability
- Disk space utilization
- Network I/O statistics
- Process count and top processes

### 4. Synthetic Monitor

**Location:** `/workspace/crazy-gary/apps/api/src/services/synthetic_monitor.py`

**Responsibilities:**
- External endpoint monitoring
- User journey testing
- SSL certificate monitoring
- TCP port monitoring
- HTTP response validation

**Supported Check Types:**
- HTTP/HTTPS checks
- Ping connectivity
- TCP port checks
- User journey workflows

### 5. Database Models

**Location:** `/workspace/crazy-gary/apps/api/src/models/monitoring_models.py`

**Models:**
- `MonitoringMetric` - Store metric data points
- `SystemAlert` - Alert storage and management
- `Incident` - Incident tracking
- `HealthCheck` - Health check results
- `SLAMetric` - SLA monitoring data
- `LogEntry` - Centralized log storage
- `SyntheticCheck` - Synthetic monitoring configuration
- `SyntheticResult` - Synthetic monitoring results
- `AlertRule` - Alert rule configuration

## Installation and Setup

### Prerequisites

```bash
# Install required Python packages
pip install psutil aiohttp requests sqlalchemy flask flask-cors flask-socketio

# Install Node.js packages for frontend
cd apps/web
npm install
```

### Database Setup

The monitoring system automatically creates the required database tables. Run the application once to initialize:

```bash
cd apps/api
python start_server.py
```

### Environment Configuration

Set the following environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# Monitoring Configuration
MONITORING_ENABLED=true
ALERT_EMAIL_SMTP_HOST=smtp.gmail.com
ALERT_EMAIL_SMTP_PORT=587
ALERT_EMAIL_USERNAME=your-email@gmail.com
ALERT_EMAIL_PASSWORD=your-app-password

# External Integrations
SENTRY_DSN=your-sentry-dsn
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### Service Registration

Register the monitoring services in your Flask application:

```python
# In your main.py
from src.services.monitoring_service import monitoring_service
from src.services.infrastructure_monitor import infrastructure_monitor
from src.services.synthetic_monitor import synthetic_monitor

# Initialize monitoring
monitoring_service.initialize(app)
infrastructure_monitor.initialize(app)
synthetic_monitor.initialize()

# Register routes
from src.routes.comprehensive_monitoring import comprehensive_monitoring_bp
app.register_blueprint(comprehensive_monitoring_bp, url_prefix='/api/monitoring')
```

## Monitoring Dashboard

### Accessing the Dashboard

1. Start the application: `python start_server.py`
2. Navigate to: `http://localhost:8080/monitoring`
3. Login with your credentials

### Dashboard Sections

#### Overview Tab
- System health status
- Active alerts count
- Average response time
- Error rate percentage
- Quick metrics summary

#### Performance Tab
- Web Vitals monitoring
- Response time trends
- Throughput metrics
- Performance budgets

#### Infrastructure Tab
- CPU, memory, disk usage
- Network I/O statistics
- Process monitoring
- Service health status

#### Alerts Tab
- Active alerts list
- Alert acknowledgment
- Alert resolution
- Alert history

#### Logs Tab
- Real-time log streaming
- Log filtering and search
- Error log analysis
- Log export functionality

#### Incidents Tab
- Incident tracking
- Incident lifecycle management
- Timeline and notes
- Resolution tracking

#### Settings Tab
- Alert threshold configuration
- Notification channel setup
- Monitoring intervals
- Integration configuration

## Alert Management

### Alert Types

1. **Critical Alerts** - System down or severe issues
2. **High Priority Alerts** - Significant performance degradation
3. **Medium Priority Alerts** - Warning conditions
4. **Low Priority Alerts** - Informational notifications
5. **Info Alerts** - Status updates

### Alert Rules

Create custom alert rules:

```python
# Create alert rule
rule_id = monitoring_service.create_alert_rule(
    name="High CPU Usage",
    metric_name="system.cpu.usage",
    condition="greater_than",
    threshold=80.0,
    severity=AlertSeverity.HIGH,
    duration=300,  # 5 minutes
    notification_channels=["email", "slack"],
    created_by="system"
)
```

### Alert Workflow

1. **Detection** - System detects threshold breach
2. **Creation** - Alert is created and stored
3. **Notification** - Alerts sent via configured channels
4. **Acknowledgment** - Team member acknowledges alert
5. **Resolution** - Issue is fixed and alert is resolved
6. **Post-mortem** - Incident is logged for analysis

### Notification Channels

- **Email** - SMTP email notifications
- **Slack** - Slack webhook integration
- **SMS** - Text message alerts (future)
- **Webhooks** - Custom webhook endpoints
- **In-app** - Dashboard notifications

## Incident Management

### Incident Lifecycle

1. **Open** - Incident is created
2. **Acknowledged** - Team is working on it
3. **Investigating** - Root cause analysis
4. **Resolved** - Issue is fixed
5. **Closed** - Post-mortem completed

### Creating Incidents

```python
# Manual incident creation
incident_id = monitoring_service.create_incident(
    title="Database Connection Failures",
    description="Multiple database connection timeouts detected",
    severity=AlertSeverity.HIGH,
    priority="high",
    created_by="john.doe",
    affected_services=["api", "web"],
    related_alerts=["alert-123", "alert-124"]
)
```

### Incident Response Workflow

1. **Detection** - Automatic or manual detection
2. **Assessment** - Severity and impact evaluation
3. **Assignment** - Assign to appropriate team member
4. **Investigation** - Root cause analysis
5. **Resolution** - Implement fix
6. **Verification** - Confirm resolution
7. **Documentation** - Create post-mortem

## Infrastructure Monitoring

### System Metrics

The system monitors:

- **CPU Usage** - Processor utilization
- **Memory Usage** - RAM utilization and availability
- **Disk Usage** - Storage space and I/O
- **Network I/O** - Bandwidth utilization
- **Process Count** - Number of running processes
- **Load Average** - System load (Unix systems)

### Monitoring Intervals

- **Metrics Collection** - Every 30 seconds
- **Health Checks** - Every 60 seconds
- **Process Monitoring** - Every 2 minutes
- **Infrastructure Health** - Every 5 minutes

### Alert Thresholds

Default thresholds:

| Metric | Warning | Critical |
|--------|---------|----------|
| CPU Usage | 70% | 90% |
| Memory Usage | 80% | 95% |
| Disk Usage | 80% | 90% |
| Process Count | 1000 | 2000 |
| Load Average | 2.0 | 5.0 |

### Performance Baselines

The system automatically establishes performance baselines by:

1. Collecting metrics for 5 minutes
2. Calculating 95th percentiles
3. Using baselines for anomaly detection
4. Updating baselines periodically

## Synthetic Monitoring

### Check Types

#### HTTP/HTTPS Monitoring

```python
# Create HTTP check
check_id = synthetic_monitor.create_check(
    name="Homepage Health",
    url="https://example.com",
    check_type="http",
    frequency=300,  # 5 minutes
    expected_status=200,
    expected_content="Welcome"
)
```

#### TCP Port Monitoring

```python
# Create TCP check
check_id = synthetic_monitor.create_check(
    name="Database Port",
    url="tcp://localhost:5432",
    check_type="tcp",
    frequency=60
)
```

#### Ping Monitoring

```python
# Create ping check
check_id = synthetic_monitor.create_check(
    name="Server Connectivity",
    url="ping://8.8.8.8",
    check_type="ping",
    frequency=30
)
```

### User Journey Testing

Create multi-step user journeys:

```python
# Create user journey
steps = [
    {"action": "navigate", "url": "https://example.com", "wait": 2000},
    {"action": "click", "url": "https://example.com/login", "wait": 1000},
    {"action": "type", "target": "#username", "value": "testuser"},
    {"action": "type", "target": "#password", "value": "testpass"},
    {"action": "click", "url": "https://example.com/login/submit", "wait": 2000}
]

journey_id = synthetic_monitor.create_user_journey_check(
    name="User Login Flow",
    steps=steps,
    frequency=900  # 15 minutes
)
```

### SSL Certificate Monitoring

The system automatically monitors SSL certificates for:
- Certificate expiration
- Certificate validity
- Chain verification
- Hostname verification

### Monitoring Results

Results are stored with:
- Response time
- Status code
- Content validation
- SSL information
- Performance metrics

## SLA Monitoring

### SLA Metrics

Track service level agreements:

- **Availability** - Uptime percentage
- **Performance** - Response time targets
- **Quality** - Error rate targets

### SLA Configuration

```python
# SLA is calculated automatically based on:
# - Health check results for availability
# - Response time metrics for performance
# - Error rate metrics for quality
```

### SLA Reporting

- Real-time SLA compliance
- Historical SLA trends
- SLA violation tracking
- Automated SLA reports

## Log Management

### Centralized Logging

All logs are centralized in the database with:

- **Timestamp** - When the log was created
- **Level** - Log severity (DEBUG, INFO, WARN, ERROR, CRITICAL)
- **Source** - Where the log originated
- **Message** - Log content
- **Metadata** - Additional structured data

### Log Aggregation

```python
# Log entries are automatically aggregated from:
# - Application logs
# - Access logs
# - Error logs
# - Performance logs
# - Security logs
```

### Log Analysis

- Real-time log streaming
- Log search and filtering
- Error pattern detection
- Log trend analysis

## API Reference

### Health and Status Endpoints

```http
GET /api/monitoring/health/dashboard
# Returns comprehensive monitoring dashboard data

GET /api/monitoring/health/system
# Returns detailed system health information

GET /api/monitoring/health/checks
# Returns health check results
```

### Alert Management

```http
GET /api/monitoring/alerts
# Get alerts with filtering and pagination

POST /api/monitoring/alerts/{alert_id}/acknowledge
# Acknowledge an alert

POST /api/monitoring/alerts/{alert_id}/resolve
# Resolve an alert

GET /api/monitoring/alerts/rules
# Get alert rules

POST /api/monitoring/alerts/rules
# Create a new alert rule
```

### Incident Management

```http
GET /api/monitoring/incidents
# Get incidents with filtering

POST /api/monitoring/incidents
# Create a new incident

PUT /api/monitoring/incidents/{incident_id}/status
# Update incident status
```

### Synthetic Monitoring

```http
GET /api/monitoring/synthetic/checks
# Get synthetic monitoring checks

POST /api/monitoring/synthetic/checks
# Create a new synthetic check

POST /api/monitoring/synthetic/checks/{check_id}/run
# Run a synthetic check manually

GET /api/monitoring/synthetic/results
# Get synthetic monitoring results
```

### Metrics and Logs

```http
GET /api/monitoring/metrics
# Get metrics with filtering and time range

GET /api/monitoring/logs
# Get log entries with filtering

POST /api/monitoring/logs
# Create a log entry
```

### SLA Monitoring

```http
GET /api/monitoring/sla/metrics
# Get SLA metrics
```

## Runbooks

### High CPU Usage Response

**Symptoms:**
- CPU usage > 90% for > 5 minutes
- System alerts triggered
- Performance degradation

**Response Steps:**
1. Check the monitoring dashboard for CPU trends
2. Identify top CPU-consuming processes:
   ```bash
   top -o %CPU
   ```
3. Check for recent deployments or code changes
4. Investigate potential memory leaks
5. Scale resources if needed
6. Document the incident and resolution

### High Memory Usage Response

**Symptoms:**
- Memory usage > 95%
- Out of memory errors
- Application crashes

**Response Steps:**
1. Check memory usage trends
2. Identify memory-consuming processes:
   ```bash
   top -o %MEM
   ```
3. Check for memory leaks in application logs
4. Restart problematic services if necessary
5. Consider memory scaling
6. Review memory configuration

### High Error Rate Response

**Symptoms:**
- Error rate > 10%
- Increased 5xx HTTP responses
- User-reported issues

**Response Steps:**
1. Check error logs for patterns
2. Review recent deployments
3. Identify failing services
4. Check external dependencies
5. Implement rollback if necessary
6. Update monitoring thresholds

### Database Connectivity Issues

**Symptoms:**
- Database health check failures
- Connection timeout errors
- Slow query performance

**Response Steps:**
1. Check database server status
2. Verify network connectivity
3. Review connection pool settings
4. Check for long-running queries
5. Monitor database resource usage
6. Consider connection scaling

### External API Failures

**Symptoms:**
- Synthetic check failures
- API timeout errors
- Increased error rates for external calls

**Response Steps:**
1. Check external service status pages
2. Verify API credentials
3. Test connectivity manually
4. Review API rate limits
5. Implement fallback mechanisms
6. Contact external service provider if needed

### Security Incidents

**Symptoms:**
- Unusual access patterns
- Failed authentication attempts
- Suspicious network traffic

**Response Steps:**
1. Immediately review access logs
2. Check for data exfiltration
3. Review firewall rules
4. Update security configurations
5. Notify security team
6. Document incident thoroughly

## Troubleshooting

### Common Issues

#### Monitoring Service Not Starting

**Symptoms:**
- No metrics being collected
- Dashboard shows "No data"
- Health checks failing

**Solutions:**
1. Check if all required packages are installed:
   ```bash
   pip install psutil aiohttp requests
   ```
2. Verify database connection
3. Check application logs for errors
4. Ensure monitoring is enabled in configuration

#### High False Positive Alert Rate

**Symptoms:**
- Too many alerts for minor issues
- Alert fatigue
- Important alerts being missed

**Solutions:**
1. Review and adjust alert thresholds
2. Implement alert suppression rules
3. Group related alerts
4. Improve alert routing logic

#### Synthetic Checks Failing

**Symptoms:**
- External endpoint checks failing
- False positives for external services
- Check timeout errors

**Solutions:**
1. Verify external service availability
2. Increase timeout values for slow endpoints
3. Add checks for specific error codes
4. Implement retry logic

#### Performance Impact

**Symptoms:**
- High CPU usage from monitoring
- Slow application response
- Increased memory usage

**Solutions:**
1. Reduce monitoring frequency
2. Optimize metric collection
3. Implement sampling for high-volume metrics
4. Use async processing where possible

#### Database Performance Issues

**Symptoms:**
- Slow metric storage
- Large database size
- Slow query performance

**Solutions:**
1. Implement metric retention policies
2. Add database indexes
3. Archive old data
4. Consider time-series database for metrics

### Debug Mode

Enable debug logging:

```python
import logging
logging.getLogger('monitoring_service').setLevel(logging.DEBUG)
logging.getLogger('infrastructure_monitor').setLevel(logging.DEBUG)
```

### Performance Profiling

Profile monitoring overhead:

```python
import cProfile
import pstats

def profile_monitoring():
    cProfile.run('monitoring_service.collect_all_metrics()', 'monitoring_profile')
    stats = pstats.Stats('monitoring_profile')
    stats.sort_stats('cumulative').print_stats(10)
```

### Testing Monitoring Components

Test individual components:

```python
# Test infrastructure monitoring
from src.services.infrastructure_monitor import get_infrastructure_monitor
monitor = get_infrastructure_monitor()
metrics = monitor.get_current_metrics()
print(metrics)

# Test synthetic monitoring
from src.services.synthetic_monitor import get_synthetic_monitor
synthetic = get_synthetic_monitor()
result = await synthetic.run_check_async('check-id')
print(result)
```

## Best Practices

### Alert Management

1. **Use Specific Alert Names** - Make alerts easily identifiable
2. **Set Appropriate Thresholds** - Avoid false positives
3. **Implement Alert Escalation** - Ensure critical issues get attention
4. **Regular Alert Review** - Periodically review and tune alerts
5. **Document Alert Responses** - Create runbooks for common alerts

### Monitoring Coverage

1. **Monitor Everything** - Cover all critical components
2. **Use Multiple Monitoring Types** - Combine synthetic, real-user, and infrastructure monitoring
3. **Monitor Dependencies** - Include external service monitoring
4. **Set Up Dashboards** - Create role-specific monitoring views
5. **Regular Health Checks** - Implement comprehensive health check coverage

### Incident Response

1. **Clear Escalation Paths** - Define who responds to what alerts
2. **Regular Training** - Ensure team knows incident procedures
3. **Post-Incident Reviews** - Learn from every incident
4. **Automation** - Automate common response actions
5. **Communication** - Keep stakeholders informed during incidents

### Performance Optimization

1. **Efficient Data Collection** - Collect only necessary metrics
2. **Appropriate Retention** - Set data retention policies
3. **Database Optimization** - Index frequently queried fields
4. **Async Processing** - Use async operations where possible
5. **Resource Monitoring** - Monitor the monitoring system itself

## Future Enhancements

### Planned Features

1. **Machine Learning Anomaly Detection**
2. **Predictive Alerting**
3. **Automated Root Cause Analysis**
4. **Mobile Monitoring App**
5. **Advanced Visualization**
6. **Multi-tenant Support**
7. **Cloud-native Monitoring**
8. **Kubernetes Integration**

### Integration Opportunities

1. **Prometheus/Grafana** - Advanced visualization
2. **ELK Stack** - Advanced log analysis
3. **Jaeger/Zipkin** - Distributed tracing
4. **Kubernetes** - Container orchestration
5. **AWS CloudWatch** - Cloud infrastructure monitoring

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly** - Review alert accuracy and false positive rates
2. **Monthly** - Analyze incident patterns and trends
3. **Quarterly** - Review and update monitoring coverage
4. **Annually** - Complete system architecture review

### Backup and Recovery

1. **Monitor Configuration** - Backup alert rules and settings
2. **Dashboard Configurations** - Export dashboard layouts
3. **Historical Data** - Implement data archival policies
4. **Disaster Recovery** - Document recovery procedures

### Performance Monitoring

Monitor the monitoring system itself:

1. **Collection Latency** - How long metric collection takes
2. **Storage Performance** - Database query performance
3. **Dashboard Load Times** - User interface responsiveness
4. **Alert Processing Time** - Time from detection to notification

## Conclusion

This comprehensive monitoring and alerting system provides end-to-end visibility into application health, performance, and user experience. The system is designed to be scalable, reliable, and actionable, enabling teams to maintain high service quality and quickly respond to issues.

For additional support or feature requests, please refer to the project documentation or contact the development team.