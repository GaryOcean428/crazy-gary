/**
 * Performance monitoring types and interfaces
 */

export interface WebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint
}

export interface PerformanceBudget {
  name: string;
  value: number;
  unit: 'ms' | 'KB' | 'MB' | 'bytes';
  type: 'largest-contentful-paint' | 'first-input-delay' | 'cumulative-layout-shift' | 'bundle-size' | 'network' | 'memory';
  threshold: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  metadata?: Record<string, any>;
}

export interface BundleAnalysis {
  name: string;
  size: number;
  gzippedSize: number;
  dependencies: BundleDependency[];
  chunks: BundleChunk[];
}

export interface BundleDependency {
  name: string;
  version: string;
  size: number;
  isDuplicate: boolean;
}

export interface BundleChunk {
  id: string;
  name: string;
  size: number;
  files: string[];
}

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface PerformanceReport {
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  webVitals: WebVitals;
  metrics: PerformanceMetric[];
  memoryUsage: MemoryUsage[];
  bundleAnalysis?: BundleAnalysis;
  budgetViolations: BudgetViolation[];
  recommendations: PerformanceRecommendation[];
}

export interface BudgetViolation {
  budget: PerformanceBudget;
  actualValue: number;
  severity: 'warning' | 'error' | 'critical';
  timestamp: number;
}

export interface PerformanceRecommendation {
  type: 'bundle-optimization' | 'code-splitting' | 'lazy-loading' | 'memory-leak' | 'render-optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  autoFixable: boolean;
}

export interface CodeSplittingMetrics {
  chunksLoaded: number;
  totalChunks: number;
  loadingTime: number;
  failedChunks: string[];
  lazyImports: LazyImportMetrics[];
}

export interface LazyImportMetrics {
  path: string;
  loadTime: number;
  fileSize: number;
  loaded: boolean;
  error?: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of sessions to monitor
  budgets: PerformanceBudget[];
  autoReport: boolean;
  reportInterval: number; // milliseconds
  enableMemoryMonitoring: boolean;
  enableBundleAnalysis: boolean;
  enableCodeSplittingMonitoring: boolean;
  alertThresholds: {
    memoryLeak: number;
    bundleSizeIncrease: number;
    performanceRegression: number;
  };
}

export interface PerformanceRegression {
  metric: string;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  severity: 'minor' | 'major' | 'critical';
  timestamp: number;
}

export interface DashboardData {
  currentReport: PerformanceReport;
  historicalReports: PerformanceReport[];
  regressions: PerformanceRegression[];
  trendData: TrendData[];
  alerts: PerformanceAlert[];
}

export interface TrendData {
  metric: string;
  values: { timestamp: number; value: number }[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface PerformanceAlert {
  id: string;
  type: 'budget-violation' | 'regression' | 'memory-leak' | 'bundle-size' | 'performance-degradation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  metadata?: Record<string, any>;
}