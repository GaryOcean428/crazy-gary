/**
 * Performance Monitor Package
 * 
 * A comprehensive performance monitoring system for React applications featuring:
 * - Web Vitals tracking (LCP, FID, CLS, FCP, TTFB, INP)
 * - Performance budget enforcement
 * - Memory usage monitoring and leak detection
 * - Bundle size analysis and code splitting monitoring
 * - Performance regression testing
 * - Real-time alerting system
 * - Interactive performance dashboard
 * - Trend analysis and reporting
 */

export { PerformanceEngine, usePerformanceStore } from './core/PerformanceEngine';
export { WebVitalsTracker } from './tracking/WebVitalsTracker';
export { BundleAnalyzer } from './tracking/BundleAnalyzer';
export { BudgetEnforcer } from './metrics/BudgetEnforcer';
export { ReportGenerator } from './metrics/ReportGenerator';
export { MemoryMonitor } from './monitoring/MemoryMonitor';
export { AlertManager } from './monitoring/AlertManager';

// React Components
export { PerformanceDashboard } from './dashboard/PerformanceDashboard';
export { WebVitalsChart } from './dashboard/WebVitalsChart';
export { MemoryChart } from './dashboard/MemoryChart';
export { BundleAnalysis } from './dashboard/BundleAnalysis';
export { AlertsPanel } from './dashboard/AlertsPanel';
export { BudgetStatus } from './dashboard/BudgetStatus';
export { PerformanceMetrics } from './dashboard/PerformanceMetrics';
export { RecommendationPanel } from './dashboard/RecommendationPanel';
export { TrendAnalysis } from './dashboard/TrendAnalysis';

// Types
export type {
  WebVitals,
  PerformanceBudget,
  PerformanceMetric,
  BundleAnalysis,
  BundleDependency,
  BundleChunk,
  MemoryUsage,
  PerformanceReport,
  BudgetViolation,
  PerformanceRecommendation,
  CodeSplittingMetrics,
  LazyImportMetrics,
  MonitoringConfig,
  PerformanceRegression,
  DashboardData,
  TrendData,
  PerformanceAlert
} from './types';

// Utility functions
export const PerformanceMonitor = {
  /**
   * Initialize performance monitoring with custom configuration
   */
  initialize: (config?: Partial<MonitoringConfig>) => {
    if (typeof window !== 'undefined') {
      const { PerformanceEngine } = require('./core/PerformanceEngine');
      PerformanceEngine.getState().initialize(config);
    }
  },

  /**
   * Start performance monitoring
   */
  start: () => {
    if (typeof window !== 'undefined') {
      const { PerformanceEngine } = require('./core/PerformanceEngine');
      PerformanceEngine.getState().startMonitoring();
    }
  },

  /**
   * Stop performance monitoring
   */
  stop: () => {
    if (typeof window !== 'undefined') {
      const { PerformanceEngine } = require('./core/PerformanceEngine');
      PerformanceEngine.getState().stopMonitoring();
    }
  },

  /**
   * Generate a performance report
   */
  generateReport: async () => {
    if (typeof window !== 'undefined') {
      const { PerformanceEngine } = require('./core/PerformanceEngine');
      return await PerformanceEngine.getState().generateReport();
    }
    return null;
  },

  /**
   * Get current performance status
   */
  getStatus: () => {
    if (typeof window !== 'undefined') {
      const store = require('./core/PerformanceEngine').usePerformanceStore.getState();
      return {
        isMonitoring: store.isMonitoring,
        config: store.config,
        currentReport: store.currentReport,
        alerts: store.alerts
      };
    }
    return null;
  }
};

// Default configuration
export const defaultConfig: Partial<MonitoringConfig> = {
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
  reportInterval: 30000,
  enableMemoryMonitoring: true,
  enableBundleAnalysis: true,
  enableCodeSplittingMonitoring: true,
  alertThresholds: {
    memoryLeak: 10,
    bundleSizeIncrease: 10,
    performanceRegression: 20
  }
};

// React Hook for easy integration
export const usePerformanceMonitoring = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { usePerformanceStore } = require('./core/PerformanceEngine');
  return usePerformanceStore();
};

// Development helpers
export const DevTools = {
  /**
   * Clear all performance data (development only)
   */
  clearAllData: () => {
    if (process.env.NODE_ENV === 'development') {
      const { WebVitalsTracker } = require('./tracking/WebVitalsTracker');
      const { MemoryMonitor } = require('./monitoring/MemoryMonitor');
      const { ReportGenerator } = require('./metrics/ReportGenerator');
      const { AlertManager } = require('./monitoring/AlertManager');
      const { BundleAnalyzer } = require('./tracking/BundleAnalyzer');

      WebVitalsTracker.clearStoredMetrics();
      MemoryMonitor.clearMemoryHistory();
      ReportGenerator.clearStoredReports();
      AlertManager.clearAllAlerts();
      BundleAnalyzer.clearAnalysis();
      
      console.log('All performance data cleared');
    }
  },

  /**
   * Get performance summary for debugging
   */
  getDebugInfo: () => {
    if (process.env.NODE_ENV === 'development') {
      const { WebVitalsTracker } = require('./tracking/WebVitalsTracker');
      const { MemoryMonitor } = require('./monitoring/MemoryMonitor');
      const { ReportGenerator } = require('./metrics/ReportGenerator');
      const { AlertManager } = require('./monitoring/AlertManager');

      return {
        webVitals: WebVitalsTracker.getStoredMetrics(),
        memory: MemoryMonitor.generateMemoryReport(),
        reports: ReportGenerator.getStoredReports().length,
        alerts: AlertManager.getAlertStats()
      };
    }
    return null;
  }
};

// Auto-initialize in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Small delay to ensure the page has loaded
  setTimeout(() => {
    try {
      const { PerformanceEngine } = require('./core/PerformanceEngine');
      PerformanceEngine.getState().initialize();
      console.log('🚀 Performance Monitor initialized in development mode');
    } catch (error) {
      console.warn('Failed to auto-initialize Performance Monitor:', error);
    }
  }, 1000);
}