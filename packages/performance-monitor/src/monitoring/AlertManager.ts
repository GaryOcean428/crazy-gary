import { PerformanceAlert } from '../types';

export class AlertManager {
  private static alerts: PerformanceAlert[] = [];
  private static callbacks: Array<(alert: PerformanceAlert) => void> = [];
  private static isInitialized = false;
  private static alertHistory: PerformanceAlert[] = [];
  private static maxHistorySize = 1000;

  static initialize() {
    if (this.isInitialized) return;
    
    // Load alerts from localStorage
    this.loadAlerts();
    this.isInitialized = true;
    
    console.log('Alert manager initialized');
  }

  static start() {
    if (!this.isInitialized) {
      this.initialize();
    }
  }

  static stop() {
    this.alerts = [];
    this.callbacks = [];
    this.isInitialized = false;
  }

  static createAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): PerformanceAlert {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(fullAlert);
    this.alertHistory.push(fullAlert);
    
    // Maintain history size limit
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.shift();
    }

    // Store in localStorage
    this.saveAlerts();

    // Notify callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(fullAlert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });

    // Log alert
    this.logAlert(fullAlert);

    return fullAlert;
  }

  private static generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static logAlert(alert: PerformanceAlert) {
    const logMessage = `[PERFORMANCE ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`;
    
    switch (alert.severity) {
      case 'critical':
        console.error(logMessage, alert);
        break;
      case 'error':
        console.error(logMessage, alert);
        break;
      case 'warning':
        console.warn(logMessage, alert);
        break;
      default:
        console.log(logMessage, alert);
    }
  }

  static subscribe(callback: (alert: PerformanceAlert) => void) {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  static getAlerts(filters?: {
    type?: PerformanceAlert['type'];
    severity?: PerformanceAlert['severity'];
    resolved?: boolean;
    since?: number;
  }): PerformanceAlert[] {
    let filtered = [...this.alerts];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(alert => alert.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(alert => alert.severity === filters.severity);
      }
      if (filters.resolved !== undefined) {
        filtered = filtered.filter(alert => alert.resolved === filters.resolved);
      }
      if (filters.since) {
        filtered = filtered.filter(alert => alert.timestamp >= filters.since!);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveAlerts();
      return true;
    }
    return false;
  }

  static deleteAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index > -1) {
      this.alerts.splice(index, 1);
      this.saveAlerts();
      return true;
    }
    return false;
  }

  static clearResolvedAlerts(): number {
    const resolvedCount = this.alerts.filter(a => a.resolved).length;
    this.alerts = this.alerts.filter(a => !a.resolved);
    this.saveAlerts();
    return resolvedCount;
  }

  static clearAllAlerts(): number {
    const count = this.alerts.length;
    this.alerts = [];
    this.saveAlerts();
    return count;
  }

  static getAlertStats(): {
    total: number;
    active: number;
    resolved: number;
    byType: Record<PerformanceAlert['type'], number>;
    bySeverity: Record<PerformanceAlert['severity'], number>;
    recentActivity: {
      lastHour: number;
      lastDay: number;
      lastWeek: number;
    };
  } {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;

    const byType: Record<PerformanceAlert['type'], number> = {
      'budget-violation': 0,
      'regression': 0,
      'memory-leak': 0,
      'bundle-size': 0,
      'performance-degradation': 0
    };

    const bySeverity: Record<PerformanceAlert['severity'], number> = {
      'info': 0,
      'warning': 0,
      'error': 0,
      'critical': 0
    };

    this.alerts.forEach(alert => {
      byType[alert.type]++;
      bySeverity[alert.severity]++;
    });

    const recentActivity = {
      lastHour: this.alerts.filter(a => a.timestamp > now - oneHour).length,
      lastDay: this.alerts.filter(a => a.timestamp > now - oneDay).length,
      lastWeek: this.alerts.filter(a => a.timestamp > now - oneWeek).length
    };

    return {
      total: this.alerts.length,
      active: this.alerts.filter(a => !a.resolved).length,
      resolved: this.alerts.filter(a => a.resolved).length,
      byType,
      bySeverity,
      recentActivity
    };
  }

  static getAlertHistory(filters?: {
    type?: PerformanceAlert['type'];
    severity?: PerformanceAlert['severity'];
    since?: number;
  }, limit = 100): PerformanceAlert[] {
    let filtered = [...this.alertHistory];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(alert => alert.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(alert => alert.severity === filters.severity);
      }
      if (filters.since) {
        filtered = filtered.filter(alert => alert.timestamp >= filters.since!);
      }
    }

    return filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  private static saveAlerts() {
    try {
      const data = {
        alerts: this.alerts,
        timestamp: Date.now()
      };
      localStorage.setItem('performance-alerts', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save alerts to localStorage:', error);
    }
  }

  private static loadAlerts() {
    try {
      const stored = localStorage.getItem('performance-alerts');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.alerts && Array.isArray(data.alerts)) {
          this.alerts = data.alerts;
        }
      }
    } catch (error) {
      console.warn('Failed to load alerts from localStorage:', error);
    }
  }

  static exportAlerts(format: 'json' | 'csv' = 'json'): string {
    const alerts = this.getAlertHistory();
    
    if (format === 'json') {
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        totalAlerts: alerts.length,
        alerts
      }, null, 2);
    }

    // CSV format
    const csvLines = [
      'ID,Type,Severity,Message,Timestamp,Resolved,Metadata',
      ...alerts.map(alert => [
        alert.id,
        alert.type,
        alert.severity,
        `"${alert.message.replace(/"/g, '""')}"`,
        new Date(alert.timestamp).toISOString(),
        alert.resolved,
        JSON.stringify(alert.metadata || {})
      ].join(','))
    ];

    return csvLines.join('\n');
  }

  static createAlertRule(rule: {
    name: string;
    condition: (metrics: any) => boolean;
    alertTemplate: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>;
    enabled: boolean;
  }) {
    // This would be used for creating custom alert rules
    // For now, store in localStorage
    try {
      const rules = this.getAlertRules();
      rules.push({
        ...rule,
        id: `rule-${Date.now()}`,
        createdAt: Date.now()
      });
      localStorage.setItem('performance-alert-rules', JSON.stringify(rules));
    } catch (error) {
      console.warn('Failed to save alert rule:', error);
    }
  }

  static getAlertRules(): any[] {
    try {
      const stored = localStorage.getItem('performance-alert-rules');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load alert rules:', error);
      return [];
    }
  }

  static evaluateAlertRules(metrics: any): PerformanceAlert[] {
    const rules = this.getAlertRules();
    const triggeredAlerts: PerformanceAlert[] = [];

    rules.forEach(rule => {
      if (rule.enabled && rule.condition(metrics)) {
        const alert = this.createAlert(rule.alertTemplate);
        triggeredAlerts.push(alert);
      }
    });

    return triggeredAlerts;
  }

  static getAlertRecommendations(): {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actions: string[];
  }[] {
    const stats = this.getAlertStats();
    const recommendations = [];

    // High priority alerts recommendation
    if (stats.bySeverity.critical > 0 || stats.bySeverity.error > 5) {
      recommendations.push({
        title: 'Address Critical Performance Issues',
        description: `${stats.bySeverity.critical + stats.bySeverity.error} critical/error alerts require immediate attention`,
        priority: 'high' as const,
        actions: [
          'Review critical alerts in the dashboard',
          'Check memory usage and potential leaks',
          'Investigate bundle size issues',
          'Review recent code changes'
        ]
      });
    }

    // Memory leak recommendation
    if (stats.byType['memory-leak'] > 0) {
      recommendations.push({
        title: 'Memory Leak Detection',
        description: 'Memory leaks detected - review component lifecycle and event listeners',
        priority: 'high' as const,
        actions: [
          'Check for unremoved event listeners',
          'Review useEffect cleanup functions',
          'Analyze component unmounting logic',
          'Use React DevTools Profiler'
        ]
      });
    }

    // Budget violations recommendation
    if (stats.byType['budget-violation'] > 3) {
      recommendations.push({
        title: 'Performance Budget Violations',
        description: 'Multiple budget violations detected - optimize performance',
        priority: 'medium' as const,
        actions: [
          'Review performance budgets',
          'Optimize bundle size',
          'Implement code splitting',
          'Enable compression'
        ]
      });
    }

    // Regression recommendation
    if (stats.byType['regression'] > 0) {
      recommendations.push({
        title: 'Performance Regression',
        description: 'Performance degradation detected - investigate recent changes',
        priority: 'high' as const,
        actions: [
          'Compare with previous performance baseline',
          'Review recent code commits',
          'Run performance profiling',
          'Rollback recent changes if necessary'
        ]
      });
    }

    return recommendations;
  }
}