# Disaster Recovery System - Quick Start Guide

## 🚀 Getting Started with Crazy-Gary Disaster Recovery

This guide will help you quickly set up and use the comprehensive disaster recovery system for your Crazy-Gary deployment.

## 📋 Prerequisites

- Railway CLI installed and configured
- PostgreSQL access credentials
- Bash shell access
- Network access to your services

## ⚡ Quick Setup (5 minutes)

### 1. Verify Script Installation
```bash
# Check if scripts are in place
ls -la /workspace/crazy-gary/scripts/ | grep -E "(backup|recovery|health|monitor)"

# Expected files:
# backup-database.sh
# restore-emergency.sh
# recovery.sh
# incident-p0.sh
# monitor.sh
# comprehensive-health-check.sh
# automated-rollback.sh
```

### 2. Configure Environment Variables
```bash
# Set essential environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crazy_gary"
export API_URL="https://api.crazy-gary.app"
export WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
```

### 3. Test System Health
```bash
# Run comprehensive health check
./scripts/comprehensive-health-check.sh

# Should output:
# ✅ API Service: Healthy
# ✅ Database: Connected
# ✅ Memory/Disk: Normal usage
```

## 🆘 Emergency Response (When Things Go Wrong)

### P0 Incident (Complete System Outage)
```bash
# Run immediately - handles complete system failure
./scripts/incident-p0.sh

# This will:
# 1. Assess the situation
# 2. Restart all services
# 3. Validate system health
# 4. Send notifications
```

### Database Issues
```bash
# Check database connectivity
./scripts/health-check.sh

# Emergency restore (if needed)
./scripts/restore-emergency.sh /opt/crazy-gary/backups/crazy_gary_backup_20251217_020000.sql.gz
```

### Service-Specific Issues
```bash
# Infrastructure recovery for specific issues
./scripts/recovery.sh database_corruption high
./scripts/recovery.sh service_hang medium
```

## 📊 Regular Maintenance

### Daily Backup (Automated)
```bash
# Manual backup (usually automated via cron)
./scripts/backup-database.sh

# Verify backup integrity
./scripts/verify-backup-integrity.sh /opt/crazy-gary/backups/crazy_gary_backup_latest.sql.gz
```

### Health Monitoring
```bash
# Start continuous monitoring (runs in background)
./scripts/monitor.sh $WEBHOOK_URL &

# Check system status anytime
./scripts/comprehensive-health-check.sh
```

### Testing Disaster Recovery
```bash
# Monthly test (safe, doesn't affect production)
./scripts/test-disaster-recovery.sh complete_outage 30

# This simulates a failure and tests recovery procedures
```

## 🎛️ Configuration

### Update Thresholds
Edit `/workspace/crazy-gary/config/disaster-recovery.conf`:
```bash
# Response time threshold (seconds)
RESPONSE_TIME_THRESHOLD=2.0

# Memory usage threshold (percentage)
MEMORY_USAGE_THRESHOLD=90.0

# Error rate threshold (percentage)
ERROR_RATE_THRESHOLD=10.0
```

### Automated Rollback Triggers
```bash
# Set up automated rollback for high error rates
./scripts/automated-rollback.sh error_rate 10.0

# Set up automated rollback for slow response times
./scripts/automated-rollback.sh response_time 2.0

# Set up automated rollback for high memory usage
./scripts/automated-rollback.sh memory_usage 90.0
```

## 📞 Emergency Contacts

### Set Up Notification
```bash
# Configure Slack webhook for alerts
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK"

# Configure email alerts
export EMAIL_RECIPIENTS="oncall@company.com,escalation@company.com"
```

### Quick Contact Reference
- **Primary On-Call:** devops-primary@company.com, +1-555-0100
- **Escalation:** engineering-manager@company.com, +1-555-0102
- **Security:** security@company.com, +1-555-0300

## 🔍 Troubleshooting

### Script Not Found
```bash
# Check if you're in the right directory
pwd
# Should show: /workspace/crazy-gary

# Make scripts executable
chmod +x scripts/*.sh
```

### Permission Denied
```bash
# Run with appropriate permissions
sudo ./scripts/backup-database.sh

# Or add user to appropriate groups
sudo usermod -a -G docker $USER
```

### Network Issues
```bash
# Test connectivity
curl -I https://api.crazy-gary.app/health

# Check Railway status
railway status

# Test database connection
psql $DATABASE_URL -c "SELECT version();"
```

## 📚 Documentation Links

- **Full Documentation:** `DISASTER_RECOVERY.md`
- **Quick Reference:** `DISASTER_RECOVERY_RUNBOOK.md`
- **Emergency Contacts:** `docs/emergency-contacts.md`
- **Testing Checklist:** `docs/disaster-recovery-testing-checklist.md`

## ✅ Success Verification

### After Setup, Verify:
- [ ] Health check script runs without errors
- [ ] Backup script creates and verifies backups
- [ ] Monitoring script starts successfully
- [ ] Emergency contacts are configured
- [ ] Webhook notifications work

### Test Scenarios:
- [ ] P0 incident response completes in < 5 minutes
- [ ] Database restore works from backup
- [ ] Automated rollback triggers function
- [ ] Health monitoring detects issues
- [ ] Notifications are delivered

## 🎯 Next Steps

1. **Schedule Backups:** Set up cron jobs for automated daily backups
2. Set up continuous. **Test Procedures:** Run monthly disaster recovery tests
4. **Train Team:** Ensure health monitoring
3 **Configure Monitoring:** all team members know emergency procedures
5. **Review Regularly:** Schedule quarterly procedure reviews

## 🆘 Need Help?

If you encounter issues:

1. **Check Documentation:** Review `DISASTER_RECOVERY.md`
2. **Check Logs:** Review Railway logs for specific errors
3. **Contact Support:** Use emergency contacts if needed
4. **Test in Safe Mode:** Use testing scripts that don't affect production

---

**Quick Start Guide Version:** 1.0  
**Last Updated:** 2025-12-17  
**For Production Use:** Always test in non-production environments first