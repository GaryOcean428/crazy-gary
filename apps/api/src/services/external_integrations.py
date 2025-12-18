"""
External Monitoring Integrations
Integration with external monitoring services like Sentry, DataDog, etc.
"""
import logging
import asyncio
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable
from dataclasses import asdict
from flask import Flask
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

from src.models.monitoring_models import SystemAlert, AlertSeverity

logger = logging.getLogger(__name__)

class ExternalIntegrationManager:
    """Manages integrations with external monitoring services"""
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.integrations = {}
        self.notification_handlers = []
        
    def initialize(self, app: Flask):
        """Initialize external integrations"""
        self.app = app
        
        # Load integration configurations
        self._load_integrations()
        
        # Setup notification handlers
        self._setup_notification_handlers()
        
        logger.info("External integration manager initialized")
    
    def _load_integrations(self):
        """Load integration configurations from environment"""
        import os
        
        # Sentry integration
        sentry_dsn = os.getenv('SENTRY_DSN')
        if sentry_dsn:
            self.integrations['sentry'] = {
                'dsn': sentry_dsn,
                'enabled': True,
                'environment': os.getenv('ENVIRONMENT', 'development')
            }
        
        # DataDog integration
        datadog_api_key = os.getenv('DATADOG_API_KEY')
        datadog_app_key = os.getenv('DATADOG_APP_KEY')
        if datadog_api_key and datadog_app_key:
            self.integrations['datadog'] = {
                'api_key': datadog_api_key,
                'app_key': datadog_app_key,
                'enabled': True,
                'site': os.getenv('DATADOG_SITE', 'datadoghq.com')
            }
        
        # Slack integration
        slack_webhook = os.getenv('SLACK_WEBHOOK_URL')
        if slack_webhook:
            self.integrations['slack'] = {
                'webhook_url': slack_webhook,
                'enabled': True,
                'channel': os.getenv('SLACK_CHANNEL', '#alerts')
            }
        
        # PagerDuty integration
        pagerduty_key = os.getenv('PAGERDUTY_API_KEY')
        if pagerduty_key:
            self.integrations['pagerduty'] = {
                'api_key': pagerduty_key,
                'enabled': True,
                'service_key': os.getenv('PAGERDUTY_SERVICE_KEY')
            }
        
        # Email integration
        smtp_host = os.getenv('ALERT_EMAIL_SMTP_HOST')
        if smtp_host:
            self.integrations['email'] = {
                'smtp_host': smtp_host,
                'smtp_port': int(os.getenv('ALERT_EMAIL_SMTP_PORT', '587')),
                'username': os.getenv('ALERT_EMAIL_USERNAME'),
                'password': os.getenv('ALERT_EMAIL_PASSWORD'),
                'from_email': os.getenv('ALERT_EMAIL_FROM', 'alerts@example.com'),
                'to_emails': os.getenv('ALERT_EMAIL_TO', '').split(','),
                'enabled': True
            }
        
        # Webhook integration
        webhook_url = os.getenv('CUSTOM_WEBHOOK_URL')
        if webhook_url:
            self.integrations['webhook'] = {
                'url': webhook_url,
                'headers': json.loads(os.getenv('CUSTOM_WEBHOOK_HEADERS', '{}')),
                'enabled': True
            }
    
    def _setup_notification_handlers(self):
        """Setup handlers for external notifications"""
        # Add to monitoring service alert callbacks
        try:
            from src.services.monitoring_service import get_monitoring_service
            monitoring_service = get_monitoring_service()
            monitoring_service.add_alert_callback(self.send_alert_to_integrations)
        except ImportError:
            logger.warning("Monitoring service not available for alert callbacks")
    
    async def send_alert_to_integrations(self, alert: Any):
        """Send alert to all configured external integrations"""
        try:
            # Convert alert to dict for external services
            alert_data = asdict(alert) if hasattr(alert, '__dict__') else alert
            
            # Send to each enabled integration
            tasks = []
            for integration_name, config in self.integrations.items():
                if config.get('enabled', False):
                    task = self._send_to_integration(integration_name, config, alert_data)
                    tasks.append(task)
            
            # Execute all integration calls concurrently
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
                
        except Exception as e:
            logger.error(f"Failed to send alert to external integrations: {str(e)}")
    
    async def _send_to_integration(self, integration_name: str, config: Dict, alert_data: Dict):
        """Send alert to a specific integration"""
        try:
            if integration_name == 'sentry':
                await self._send_to_sentry(config, alert_data)
            elif integration_name == 'datadog':
                await self._send_to_datadog(config, alert_data)
            elif integration_name == 'slack':
                await self._send_to_slack(config, alert_data)
            elif integration_name == 'pagerduty':
                await self._send_to_pagerduty(config, alert_data)
            elif integration_name == 'email':
                await self._send_to_email(config, alert_data)
            elif integration_name == 'webhook':
                await self._send_to_webhook(config, alert_data)
            else:
                logger.warning(f"Unknown integration: {integration_name}")
                
        except Exception as e:
            logger.error(f"Failed to send to {integration_name}: {str(e)}")
    
    async def _send_to_sentry(self, config: Dict, alert_data: Dict):
        """Send alert to Sentry"""
        try:
            import sentry_sdk
            from sentry_sdk import capture_exception, capture_message
            
            # Initialize Sentry if not already done
            if not sentry_sdk.Hub.current.client:
                sentry_sdk.init(
                    dsn=config['dsn'],
                    environment=config.get('environment', 'development'),
                    traces_sample_rate=0.1
                )
            
            # Create Sentry event
            severity = alert_data.get('severity', 'info')
            title = alert_data.get('title', 'Alert')
            description = alert_data.get('description', '')
            
            # Map severity levels
            sentry_level = {
                'critical': 'fatal',
                'high': 'error',
                'medium': 'warning',
                'low': 'info',
                'info': 'info'
            }.get(severity.lower(), 'info')
            
            # Capture the alert
            with sentry_sdk.push_scope() as scope:
                scope.set_tag('alert_id', alert_data.get('id'))
                scope.set_tag('alert_source', alert_data.get('source'))
                scope.set_tag('alert_severity', severity)
                
                if alert_data.get('tags'):
                    for tag in alert_data['tags']:
                        scope.set_tag(tag, 'true')
                
                if description:
                    capture_message(f"{title}: {description}", level=sentry_level)
                else:
                    capture_message(title, level=sentry_level)
            
            logger.debug(f"Alert sent to Sentry: {title}")
            
        except Exception as e:
            logger.error(f"Failed to send to Sentry: {str(e)}")
    
    async def _send_to_datadog(self, config: Dict, alert_data: Dict):
        """Send alert to DataDog"""
        try:
            import httpx
            
            # Prepare DataDog event
            event_data = {
                'title': alert_data.get('title', 'Alert'),
                'text': alert_data.get('description', ''),
                'alert_type': self._map_datadog_alert_type(alert_data.get('severity')),
                'source_type_name': alert_data.get('source', 'monitoring_system'),
                'tags': [
                    f"alert_id:{alert_data.get('id')}",
                    f"severity:{alert_data.get('severity')}",
                    f"source:{alert_data.get('source')}"
                ]
            }
            
            # Add metric data if available
            if alert_data.get('metric_name') and alert_data.get('current_value'):
                event_data['aggregation_key'] = alert_data['metric_name']
                event_data['metric'] = alert_data['metric_name']
                event_data['metric_value'] = alert_data['current_value']
            
            # Send to DataDog
            url = f"https://api.{config['site']}/api/v1/events"
            headers = {
                'DD-API-KEY': config['api_key'],
                'DD-APPLICATION-KEY': config['app_key'],
                'Content-Type': 'application/json'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=event_data, timeout=30)
                response.raise_for_status()
            
            logger.debug(f"Alert sent to DataDog: {alert_data.get('title')}")
            
        except Exception as e:
            logger.error(f"Failed to send to DataDog: {str(e)}")
    
    async def _send_to_slack(self, config: Dict, alert_data: Dict):
        """Send alert to Slack"""
        try:
            import httpx
            
            # Prepare Slack message
            severity = alert_data.get('severity', 'info').upper()
            title = alert_data.get('title', 'Alert')
            description = alert_data.get('description', '')
            
            # Map severity to colors
            color_map = {
                'CRITICAL': 'danger',
                'HIGH': 'warning',
                'MEDIUM': '#ffaa00',
                'LOW': 'good',
                'INFO': '#439FE0'
            }
            
            slack_payload = {
                'channel': config.get('channel', '#alerts'),
                'username': 'Monitoring Bot',
                'icon_emoji': ':warning:',
                'attachments': [{
                    'color': color_map.get(severity, '#439FE0'),
                    'title': title,
                    'text': description,
                    'fields': [
                        {
                            'title': 'Severity',
                            'value': severity,
                            'short': True
                        },
                        {
                            'title': 'Source',
                            'value': alert_data.get('source', 'Unknown'),
                            'short': True
                        },
                        {
                            'title': 'Alert ID',
                            'value': alert_data.get('id', 'N/A'),
                            'short': True
                        },
                        {
                            'title': 'Timestamp',
                            'value': datetime.fromisoformat(alert_data.get('created_at', '')).strftime('%Y-%m-%d %H:%M:%S') if alert_data.get('created_at') else 'N/A',
                            'short': True
                        }
                    ],
                    'footer': 'Monitoring System',
                    'ts': int(datetime.utcnow().timestamp())
                }]
            }
            
            # Add metric information if available
            if alert_data.get('metric_name'):
                slack_payload['attachments'][0]['fields'].append({
                    'title': 'Metric',
                    'value': f"{alert_data['metric_name']}: {alert_data.get('current_value', 'N/A')}",
                    'short': True
                })
            
            # Send to Slack
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    config['webhook_url'],
                    json=slack_payload,
                    timeout=30
                )
                response.raise_for_status()
            
            logger.debug(f"Alert sent to Slack: {title}")
            
        except Exception as e:
            logger.error(f"Failed to send to Slack: {str(e)}")
    
    async def _send_to_pagerduty(self, config: Dict, alert_data: Dict):
        """Send alert to PagerDuty"""
        try:
            import httpx
            
            # Prepare PagerDuty incident
            severity = alert_data.get('severity', 'info').lower()
            
            # Map severity levels
            pd_severity_map = {
                'critical': 'critical',
                'high': 'error',
                'medium': 'warning',
                'low': 'info',
                'info': 'info'
            }
            
            payload = {
                'incident': {
                    'type': 'incident',
                    'title': alert_data.get('title', 'Alert'),
                    'service': {
                        'id': config.get('service_key'),
                        'type': 'service_reference'
                    },
                    'urgency': 'high' if severity in ['critical', 'high'] else 'low',
                    'body': {
                        'type': 'incident_body',
                        'details': alert_data.get('description', '')
                    }
                }
            }
            
            # Add custom details
            if alert_data.get('metric_name') or alert_data.get('current_value'):
                payload['incident']['body']['custom_details'] = {
                    'alert_id': alert_data.get('id'),
                    'severity': alert_data.get('severity'),
                    'source': alert_data.get('source'),
                    'metric_name': alert_data.get('metric_name'),
                    'current_value': alert_data.get('current_value'),
                    'threshold': alert_data.get('threshold')
                }
            
            # Send to PagerDuty
            url = "https://api.pagerduty.com/incidents"
            headers = {
                'Authorization': f"Token token={config['api_key']}",
                'Accept': 'application/vnd.pagerduty+json;version=2',
                'Content-Type': 'application/json',
                'From': 'monitoring-system@example.com'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
            
            logger.debug(f"Alert sent to PagerDuty: {alert_data.get('title')}")
            
        except Exception as e:
            logger.error(f"Failed to send to PagerDuty: {str(e)}")
    
    async def _send_to_email(self, config: Dict, alert_data: Dict):
        """Send alert via email"""
        try:
            # Create email content
            subject = f"[{alert_data.get('severity', 'INFO').upper()}] {alert_data.get('title', 'Alert')}"
            
            body = f"""
Alert Details:
- Alert ID: {alert_data.get('id')}
- Severity: {alert_data.get('severity')}
- Source: {alert_data.get('source')}
- Timestamp: {alert_data.get('created_at')}
- Title: {alert_data.get('title')}
- Description: {alert_data.get('description')}

"""
            
            if alert_data.get('metric_name'):
                body += f"""
Metric Information:
- Metric: {alert_data.get('metric_name')}
- Current Value: {alert_data.get('current_value')}
- Threshold: {alert_data.get('threshold')}
"""
            
            if alert_data.get('tags'):
                body += f"\nTags: {', '.join(alert_data['tags'])}"
            
            body += "\n\nThis is an automated alert from the monitoring system."
            
            # Create message
            msg = MimeMultipart()
            msg['From'] = config['from_email']
            msg['To'] = ', '.join(config['to_emails'])
            msg['Subject'] = subject
            
            msg.attach(MimeText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(config['smtp_host'], config['smtp_port'])
            server.starttls()
            server.login(config['username'], config['password'])
            server.send_message(msg)
            server.quit()
            
            logger.debug(f"Alert sent via email: {alert_data.get('title')}")
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
    
    async def _send_to_webhook(self, config: Dict, alert_data: Dict):
        """Send alert to custom webhook"""
        try:
            import httpx
            
            # Prepare webhook payload
            payload = {
                'alert': alert_data,
                'timestamp': datetime.utcnow().isoformat(),
                'source': 'monitoring_system'
            }
            
            # Send to webhook
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    config['url'],
                    json=payload,
                    headers=config.get('headers', {}),
                    timeout=30
                )
                response.raise_for_status()
            
            logger.debug(f"Alert sent to webhook: {alert_data.get('title')}")
            
        except Exception as e:
            logger.error(f"Failed to send to webhook: {str(e)}")
    
    def _map_datadog_alert_type(self, severity: str) -> str:
        """Map alert severity to DataDog alert type"""
        mapping = {
            'critical': 'error',
            'high': 'warning',
            'medium': 'warning',
            'low': 'info',
            'info': 'info'
        }
        return mapping.get(severity.lower(), 'info')
    
    async def send_heartbeat(self, service_name: str, status: str = 'ok'):
        """Send heartbeat to monitoring services"""
        try:
            heartbeat_data = {
                'service': service_name,
                'status': status,
                'timestamp': datetime.utcnow().isoformat(),
                'version': '1.0.0'
            }
            
            # Send to integrations that support heartbeats
            if 'datadog' in self.integrations:
                await self._send_datadog_heartbeat(heartbeat_data)
            
            if 'pagerduty' in self.integrations:
                await self._send_pagerduty_heartbeat(heartbeat_data)
                
        except Exception as e:
            logger.error(f"Failed to send heartbeat: {str(e)}")
    
    async def _send_datadog_heartbeat(self, data: Dict):
        """Send heartbeat to DataDog"""
        try:
            import httpx
            
            config = self.integrations['datadog']
            
            # Send as a metric
            payload = {
                'series': [{
                    'metric': 'monitoring.heartbeat',
                    'points': [[int(datetime.utcnow().timestamp()), 1]],
                    'tags': [
                        f"service:{data['service']}",
                        f"status:{data['status']}",
                        f"version:{data['version']}"
                    ],
                    'type': 'count'
                }]
            }
            
            url = f"https://api.{config['site']}/api/v1/series"
            headers = {
                'DD-API-KEY': config['api_key'],
                'DD-APPLICATION-KEY': config['app_key'],
                'Content-Type': 'application/json'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                
        except Exception as e:
            logger.error(f"Failed to send DataDog heartbeat: {str(e)}")
    
    async def _send_pagerduty_heartbeat(self, data: Dict):
        """Send heartbeat to PagerDuty"""
        try:
            import httpx
            
            config = self.integrations['pagerduty']
            
            # Send as an event
            payload = {
                'routing_key': config['service_key'],
                'event_action': 'resolve',
                'dedup_key': f"heartbeat-{data['service']}",
                'payload': {
                    'summary': f'Heartbeat: {data["service"]} - {data["status"]}',
                    'severity': 'info',
                    'source': 'monitoring-system',
                    'component': data['service'],
                    'group': 'monitoring',
                    'class': 'heartbeat'
                }
            }
            
            url = "https://events.pagerduty.com/v2/enqueue"
            headers = {
                'Content-Type': 'application/json'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                
        except Exception as e:
            logger.error(f"Failed to send PagerDuty heartbeat: {str(e)}")
    
    def get_integration_status(self) -> Dict[str, Dict]:
        """Get status of all integrations"""
        status = {}
        for name, config in self.integrations.items():
            status[name] = {
                'enabled': config.get('enabled', False),
                'configured': True,
                'last_test': None,
                'last_error': None
            }
        return status

# Global external integration manager
external_integration_manager = ExternalIntegrationManager()

def get_external_integration_manager() -> ExternalIntegrationManager:
    """Get the global external integration manager instance"""
    return external_integration_manager