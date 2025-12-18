#!/usr/bin/env python3
"""
Setup Default Monitoring Configuration
Creates default monitoring checks and configurations
"""
import os
import sys
import asyncio
import logging
from datetime import datetime

# Add the apps/api directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps', 'api'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def setup_default_monitoring():
    """Setup default monitoring configuration"""
    try:
        # Set up environment for the Flask app
        os.environ['FLASK_ENV'] = 'development'
        os.environ['DATABASE_URL'] = 'sqlite:///monitoring.db'
        
        # Import Flask app and monitoring services
        from src.main import app
        from src.utils.monitoring_setup import initialize_monitoring_system
        from src.services.synthetic_monitor import get_synthetic_monitor
        from src.services.monitoring_service import get_monitoring_service, AlertSeverity
        
        # Initialize the monitoring system
        logger.info("Initializing monitoring system...")
        initialize_monitoring_system(app)
        
        # Create additional synthetic checks for external services
        await create_external_synthetic_checks()
        
        # Create additional alert rules
        await create_additional_alert_rules()
        
        # Test the monitoring system
        await test_monitoring_system()
        
        logger.info("✅ Default monitoring setup completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to setup default monitoring: {str(e)}")
        raise

async def create_external_synthetic_checks():
    """Create synthetic checks for external services"""
    try:
        synthetic_monitor = get_synthetic_monitor()
        
        # Google DNS check
        google_dns_id = synthetic_monitor.create_check(
            name="Google DNS Availability",
            url="https://8.8.8.8",
            check_type="http",
            frequency=300,  # 5 minutes
            timeout=10,
            expected_status=200
        )
        
        # GitHub API check
        github_api_id = synthetic_monitor.create_check(
            name="GitHub API Health",
            url="https://api.github.com/zen",
            check_type="http",
            frequency=600,  # 10 minutes
            timeout=15,
            expected_status=200
        )
        
        # Example external service (replace with your actual services)
        example_service_id = synthetic_monitor.create_check(
            name="Example External Service",
            url="https://httpbin.org/status/200",
            check_type="http",
            frequency=900,  # 15 minutes
            timeout=20,
            expected_status=200
        )
        
        logger.info(f"Created external synthetic checks: Google DNS({google_dns_id}), GitHub API({github_api_id}), Example Service({example_service_id})")
        
    except Exception as e:
        logger.error(f"Failed to create external synthetic checks: {str(e)}")

async def create_additional_alert_rules():
    """Create additional alert rules"""
    try:
        monitoring_service = get_monitoring_service()
        
        # Network connectivity alert
        network_rule_id = monitoring_service.create_alert_rule(
            name="Network Connectivity Issues",
            metric_name="system.network.bytes_sent",
            condition="equals",
            threshold=0,
            severity=AlertSeverity.MEDIUM,
            duration=600,  # 10 minutes
            notification_channels=["slack"],
            created_by="setup_script"
        )
        
        # Process count alert
        process_rule_id = monitoring_service.create_alert_rule(
            name="High Process Count",
            metric_name="system.processes.count",
            condition="greater_than",
            threshold=500,
            severity=AlertSeverity.MEDIUM,
            duration=300,
            notification_channels=["email"],
            created_by="setup_script"
        )
        
        logger.info(f"Created additional alert rules: Network({network_rule_id}), Processes({process_rule_id})")
        
    except Exception as e:
        logger.error(f"Failed to create additional alert rules: {str(e)}")

async def test_monitoring_system():
    """Test the monitoring system"""
    try:
        # Test infrastructure monitoring
        from src.services.infrastructure_monitor import get_infrastructure_monitor
        infrastructure_monitor = get_infrastructure_monitor()
        metrics = infrastructure_monitor.get_current_metrics()
        logger.info(f"Infrastructure metrics: CPU {metrics.cpu_percent}%, Memory {metrics.memory_percent}%")
        
        # Test synthetic monitoring
        synthetic_monitor = get_synthetic_monitor()
        checks = synthetic_monitor.get_all_checks_status()
        logger.info(f"Synthetic checks configured: {len(checks)}")
        
        # Test monitoring service
        monitoring_service = get_monitoring_service()
        health_status = monitoring_service.get_health_status()
        logger.info(f"System health status: {health_status['status']}")
        
        # Test external integrations
        from src.services.external_integrations import get_external_integration_manager
        external_manager = get_external_integration_manager()
        integration_status = external_manager.get_integration_status()
        logger.info(f"External integrations: {list(integration_status.keys())}")
        
    except Exception as e:
        logger.error(f"Failed to test monitoring system: {str(e)}")

async def create_sample_user_journeys():
    """Create sample user journey checks"""
    try:
        synthetic_monitor = get_synthetic_monitor()
        
        # Sample e-commerce user journey
        ecommerce_journey_steps = [
            {"action": "navigate", "url": "https://demo.opencart.com/", "wait": 2000},
            {"action": "click", "url": "https://demo.opencart.com/index.php?route=product/category&path=20", "wait": 1500},
            {"action": "click", "url": "https://demo.opencart.com/index.php?route=product/product&path=20&product_id=28", "wait": 1000},
            {"action": "wait", "duration": 1000}  # Page load wait
        ]
        
        ecommerce_journey_id = synthetic_monitor.create_user_journey_check(
            name="E-commerce Product Browse",
            steps=ecommerce_journey_steps,
            frequency=1800,  # 30 minutes
            timeout=90
        )
        
        logger.info(f"Created sample user journey: E-commerce Browse({ecommerce_journey_id})")
        
    except Exception as e:
        logger.error(f"Failed to create sample user journeys: {str(e)}")

def print_monitoring_dashboard_info():
    """Print information about accessing the monitoring dashboard"""
    print("\n" + "="*60)
    print("📊 MONITORING DASHBOARD ACCESS")
    print("="*60)
    print("1. Start the application:")
    print("   cd apps/api && python start_server.py")
    print("\n2. Access the monitoring dashboard:")
    print("   http://localhost:8080/monitoring")
    print("\n3. Key monitoring endpoints:")
    print("   • Dashboard: /api/monitoring/health/dashboard")
    print("   • Health: /api/monitoring/health/system")
    print("   • Alerts: /api/monitoring/alerts")
    print("   • Incidents: /api/monitoring/incidents")
    print("   • Synthetic Checks: /api/monitoring/synthetic/checks")
    print("   • Logs: /api/monitoring/logs")
    print("\n4. Environment variables for external integrations:")
    print("   • SENTRY_DSN - Error tracking")
    print("   • SLACK_WEBHOOK_URL - Slack notifications")
    print("   • ALERT_EMAIL_SMTP_HOST - Email alerts")
    print("   • PAGERDUTY_API_KEY - PagerDuty integration")
    print("="*60)

def main():
    """Main function"""
    print("🚀 Setting up comprehensive monitoring and alerting system...")
    print("This will create default monitoring configurations and tests.")
    
    try:
        # Run the setup
        asyncio.run(setup_default_monitoring())
        
        # Create sample user journeys
        asyncio.run(create_sample_user_journeys())
        
        # Print dashboard access information
        print_monitoring_dashboard_info()
        
        print("\n✅ Monitoring system setup completed successfully!")
        print("\nThe system will now:")
        print("• Monitor infrastructure metrics every 30 seconds")
        print("• Run synthetic checks every 5-15 minutes")
        print("• Send alerts via configured channels")
        print("• Track incidents and health status")
        print("• Provide real-time monitoring dashboard")
        
    except Exception as e:
        logger.error(f"Setup failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()