import { create } from 'zustand';
import { WebVitals } from 'web-vitals';
import { 
  MonitoringConfig, 
  PerformanceReport, 
  PerformanceMetric, 
  BudgetViolation, 
  PerformanceAlert,
  MemoryUsage,
  BundleAnalysis 
} from '../types';
import { WebVitalsTracker } from '../tracking/WebVitalsTracker';
import { BudgetEnforcer } from '../metrics/BudgetEnforcer';
import { MemoryMonitor } from '../monitoring/MemoryMonitor';
import { BundleAnalyzer } from '../tracking/BundleAnalyzer';
import { ReportGenerator } from '../metrics/ReportGenerator';
import { AlertManager } from '../monitoring/AlertManager';

interface PerformanceStore {
  config: MonitoringConfig;
  currentReport: PerformanceReport | null;
  alerts: PerformanceAlert[];
  isMonitoring: boolean;
  startTime: number;
  
  // Actions
  initialize: (config: Partial<MonitoringConfig>) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  updateConfig: (config: Partial<MonitoringConfig>) => void;
  addMetric: (metric: PerformanceMetric) => void;
  checkBudgets: () => BudgetViolation[];
  generateReport: () => Promise<PerformanceReport>;
  clearAlerts: () => void;
  resolveAlert: (alertId: string) => void;
}

export const usePerformanceStore = create<PerformanceStore>((set, get) => ({
  config: {
    enabled: true,
    sampleRate: 1.0,
    budgets: [
      { name: 'LCP', value: 2500, unit: 'ms', type: 'largest-contentful-paint', threshold: 'good' },
      { name: 'FID', value: 100, unit: 'ms', type: 'first-input-delay', threshold: 'good' },
      { name: 'CLS', value: 0.1, unit: 'ms', type: 'cumulative-layout-shift', threshold: 'good' },
      { name: 'Bundle Size', value: 500, unit: 'KB', type: 'bundle-size', threshold: 'good' },
      { name: 'Memory Usage', value: 50, unit: 'MB', type: 'memory', threshold: 'good' }
    ],
    autoReport: true,
    reportInterval: 30000, // 30 seconds
    enableMemoryMonitoring: true,
    enableBundleAnalysis: true,
    enableCodeSplittingMonitoring: true,
    alertThresholds: {
      memoryLeak: 10, // MB increase
      bundleSizeIncrease: 10, // percentage
      performanceRegression: 20 // percentage
    }
  },
  currentReport: null,
  alerts: [],
  isMonitoring: false,
  startTime: Date.now(),

  initialize: (config) => {
    const newConfig = { ...get().config, ...config };
    set({ config: newConfig });
    
    if (newConfig.enabled) {
      // Initialize tracking components
      WebVitalsTracker.initialize();
      BudgetEnforcer.initialize(newConfig.budgets);
      
      if (newConfig.enableMemoryMonitoring) {
        MemoryMonitor.initialize();
      }
      
      if (newConfig.enableBundleAnalysis) {
        BundleAnalyzer.initialize();
      }
      
      AlertManager.initialize();
    }
  },

  startMonitoring: () => {
    const { config } = get();
    
    if (!config.enabled) {
      console.warn('Performance monitoring is disabled');
      return;
    }

    // Start Web Vitals tracking
    WebVitalsTracker.start((metric: WebVitals) => {
      const metricData: PerformanceMetric = {
        name: Object.keys(metric)[0],
        value: Object.values(metric)[0] as number,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      get().addMetric(metricData);
    });

    // Start memory monitoring if enabled
    if (config.enableMemoryMonitoring) {
      MemoryMonitor.start((usage: MemoryUsage) => {
        // Handle memory usage data
        const currentReport = get().currentReport;
        if (currentReport) {
          currentReport.memoryUsage.push(usage);
        }
      });
    }

    // Start auto reporting
    if (config.autoReport) {
      setInterval(() => {
        get().generateReport();
      }, config.reportInterval);
    }

    set({ isMonitoring: true, startTime: Date.now() });
  },

  stopMonitoring: () => {
    WebVitalsTracker.stop();
    MemoryMonitor.stop();
    BundleAnalyzer.stop();
    AlertManager.stop();
    
    set({ isMonitoring: false });
  },

  updateConfig: (config) => {
    const newConfig = { ...get().config, ...config };
    set({ config: newConfig });
    
    // Apply new budget configuration
    BudgetEnforcer.updateBudgets(newConfig.budgets);
  },

  addMetric: (metric) => {
    const currentReport = get().currentReport;
    if (currentReport) {
      currentReport.metrics.push(metric);
    }
    
    // Check budgets immediately
    const violations = get().checkBudgets();
    violations.forEach(violation => {
      AlertManager.createAlert({
        type: 'budget-violation',
        severity: violation.severity,
        message: `Budget violation: ${violation.budget.name} (${violation.actualValue}${violation.budget.unit}) exceeded budget (${violation.budget.value}${violation.budget.unit})`,
        metadata: { violation }
      });
    });
  },

  checkBudgets: () => {
    return BudgetEnforcer.checkAllBudgets(get().currentReport);
  },

  generateReport: async () => {
    const report = await ReportGenerator.generate(get().config);
    set({ currentReport: report });
    
    // Check for regressions
    const regressions = await ReportGenerator.checkRegressions(report);
    regressions.forEach(regression => {
      AlertManager.createAlert({
        type: 'regression',
        severity: regression.severity === 'critical' ? 'error' : 'warning',
        message: `Performance regression detected: ${regression.metric} degraded by ${regression.percentageChange.toFixed(1)}%`,
        metadata: { regression }
      });
    });
    
    return report;
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },

  resolveAlert: (alertId) => {
    const alerts = get().alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    );
    set({ alerts });
  }
}));

// Initialize performance monitoring on module load
if (typeof window !== 'undefined') {
  usePerformanceStore.getState().initialize({});
}