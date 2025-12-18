# Disaster Recovery Runbook - Quick Reference

## 🚨 Emergency Response Procedures

### P0 Incident (Complete System Outage)
```bash
# Immediate response (within 5 minutes)
./scripts/incident-p0.sh
```

### Database Corruption
```bash
# Emergency restore from backup
./scripts/restore-emergency.sh <backup_file>
```

### Automated Rollback
```bash
# Trigger based on thresholds
./scripts/automated-rollback.sh <trigger_type> <threshold>
```

### System Health Check
```bash
# Comprehensive system validation
./scripts/comprehensive-health-check.sh
```

## 📞 Emergency Contacts
- **Primary On-Call:** devops-primary@company.com, +1-555-0100
- **Escalation:** engineering-manager@company.com, +1-555-0102
- **Security:** security@company.com, +1-555-0300

## ⏱️ Recovery Time Objectives (RTO)
| Service | RTO | Priority |
|---------|-----|----------|
| API Service | 10 minutes | Critical |
| Database | 15 minutes | Critical |
| Web Frontend | 30 minutes | High |

## 📊 Recovery Point Objectives (RPO)
| Data Type | RPO | Backup Frequency |
|-----------|-----|------------------|
| Database | 5 minutes | Every 15 minutes |
| Transactions | 15 minutes | Every 15 minutes |

## 🔄 Regular Maintenance

### Daily Backup
```bash
# Automated at 2:00 AM UTC
./scripts/backup-database.sh
```

### Monthly Testing
```bash
# Backup restore test
./scripts/test-disaster-recovery.sh monthly
```

### Health Monitoring
```bash
# Continuous monitoring
./scripts/monitor.sh <webhook_url>
```

## 📋 Quick Checklist

### Incident Response
- [ ] Assess incident severity
- [ ] Notify on-call engineer
- [ ] Execute recovery procedures
- [ ] Validate system functionality
- [ ] Update stakeholders
- [ ] Document incident

### Recovery Validation
- [ ] API endpoints responding
- [ ] Database connectivity confirmed
- [ ] Memory/disk usage normal
- [ ] External services operational
- [ ] User sessions intact
- [ ] Data integrity verified

## 🔧 Common Issues & Solutions

### API Service Down
```bash
railway service restart crazy-gary-api
./scripts/health-check.sh
```

### Database Connection Issues
```bash
railway service restart crazy-gary-db
sleep 60
./scripts/health-check.sh
```

### High Memory Usage
```bash
./scripts/automated-rollback.sh memory_usage 90.0
```

## 📝 Post-Incident Actions
1. Complete post-incident review template
2. Update this runbook if procedures changed
3. Schedule team training if needed
4. Update monitoring thresholds if applicable

## 🔗 Important Links
- **Status Page:** https://status.crazy-gary.app
- **Railway Dashboard:** https://railway.app/project/...
- **Documentation:** `/workspace/crazy-gary/docs/`

---
**Last Updated:** 2025-12-17
**Next Review:** 2026-01-17