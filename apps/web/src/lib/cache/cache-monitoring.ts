/**
 * Cache performance monitoring and analytics
 */

import { useState, useEffect } from 'react';
import { CacheStats, CacheMonitoringConfig } from './cache-types';
import { cacheManager } from './cache-manager';
import { CACHE_MONITORING_CONFIG } from './cache-config';

interface CacheMetric {
  name: string;
  value: number;
  timestamp: number;
  backend?: string;
  metadata?: Record<string, any>;
}

interface PerformanceAlert {
  id: string;
  type: 'hitRate' | 'memory' | 'latency' | 'error' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: number;
  resolved: boolean;
  metadata?: Record<string, any>;
}

interface LatencyMeasurement {
  operation: 'get' | 'set' | 'delete' | 'clear' | 'has' | 'keys' | 'size';
  backend: string;
  duration: number;
  success: boolean;
  timestamp: number;
  key?: string;
  keySize?: number;
}

interface CacheEfficiency {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  stalenessRate: number;
  averageLatency: number;
  memoryEfficiency: number;
  overall: number;
}

export class CacheMonitoringService {
  private config: CacheMonitoringConfig;
  private metrics: CacheMetric[] = [];
  private latencyMeasurements: LatencyMeasurement[] = [];
  private alerts: PerformanceAlert[] = [];
  private samplingRate: number;
  private maxMetricsHistory = 10000;
  private maxLatencyMeasurements = 5000;
  private isInitialized = false;

  constructor(config: CacheMonitoringConfig = CACHE_MONITORING_CONFIG) {
    this.config = config;
    this.samplingRate = config.samplingRate;
    this.startMonitoring();
  }

  private startMonitoring(): void {
    if (!this.config.enabled) return;

    // Start periodic monitoring
    this.isInitialized = true;
    
    // Monitor every 30 seconds
    setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
      this.cleanupOldData();
    }, 30 * 1000);

    // Monitor memory usage every 10 seconds
    setInterval(() => {
      this.measureMemoryUsage();
    }, 10 * 1000);

    // Start latency monitoring for cache operations
    this.setupLatencyMonitoring();
  }

  // Metric collection
  private async collectMetrics(): Promise<void> {
    if (Math.random() > this.samplingRate) return;

    try {
      // Collect basic stats from all backends
      const backends = ['memory', 'localStorage', 'sessionStorage'];
      
      for (const backend of backends) {
        const stats = await cacheManager.stats(backend);
        
        this.recordMetric('cache.hits', stats.hits, backend);
        this.recordMetric('cache.misses', stats.misses, backend);
        this.recordMetric('cache.hitRate', stats.hitRate, backend);
        this.recordMetric('cache.totalSize', stats.totalSize, backend);
        this.recordMetric('cache.entryCount', stats.entryCount, backend);
        this.recordMetric('cache.averageSize', stats.averageSize, backend);
      }

      // Collect aggregate stats
      const aggregateStats = await cacheManager.stats();
      this.recordMetric('cache.aggregate.hits', aggregateStats.hits);
      this.recordMetric('cache.aggregate.misses', aggregateStats.misses);
      this.recordMetric('cache.aggregate.hitRate', aggregateStats.hitRate);
      this.recordMetric('cache.aggregate.totalSize', aggregateStats.totalSize);
      this.recordMetric('cache.aggregate.entryCount', aggregateStats.entryCount);

      // Collect efficiency metrics
      const efficiency = await this.calculateCacheEfficiency();
      this.recordMetric('cache.efficiency.overall', efficiency.overall);
      this.recordMetric('cache.efficiency.hitRate', efficiency.hitRate);
      this.recordMetric('cache.efficiency.evictionRate', efficiency.evictionRate);
      this.recordMetric('cache.efficiency.stalenessRate', efficiency.stalenessRate);
      this.recordMetric('cache.efficiency.memoryEfficiency', efficiency.memoryEfficiency);

    } catch (error) {
      this.recordMetric('cache.errors.monitoring', 1, undefined, { error: error.message });
    }
  }

  private async calculateCacheEfficiency(): Promise<CacheEfficiency> {
    const backends = ['memory', 'localStorage', 'sessionStorage'];
    let totalHits = 0;
    let totalMisses = 0;
    let totalEvictions = 0;
    let totalStale = 0;
    let totalLatency = 0;
    let totalOperations = 0;
    let totalMemoryUsed = 0;
    let totalMemoryAvailable = 0;

    for (const backend of backends) {
      const stats = await cacheManager.stats(backend);
      const keys = await cacheManager.keys(backend);
      
      totalHits += stats.hits;
      totalMisses += stats.misses;
      
      // Estimate evictions based on key turnover
      const estimatedEvictions = keys.length * 0.1; // Rough estimate
      totalEvictions += estimatedEvictions;
      
      // Count stale entries
      let staleCount = 0;
      for (const key of keys.slice(0, 100)) { // Sample first 100 keys
        try {
          const value = await cacheManager.get(key, backend);
          if (value && typeof value === 'object' && '_invalidated' in value) {
            staleCount++;
          }
        } catch {
          // Ignore errors
        }
      }
      totalStale += staleCount;
      
      totalMemoryUsed += stats.totalSize;
      totalMemoryAvailable += stats.maxSize || 1000; // Assume max size
      
      // Get average latency for this backend
      const backendLatencies = this.latencyMeasurements
        .filter(m => m.backend === backend)
        .slice(-100); // Last 100 measurements
      
      if (backendLatencies.length > 0) {
        const backendAvgLatency = backendLatencies.reduce((sum, m) => sum + m.duration, 0) / backendLatencies.length;
        totalLatency += backendAvgLatency;
        totalOperations += backendLatencies.length;
      }
    }

    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    const missRate = totalRequests > 0 ? totalMisses / totalRequests : 0;
    const evictionRate = totalRequests > 0 ? totalEvictions / totalRequests : 0;
    const stalenessRate = totalRequests > 0 ? totalStale / totalRequests : 0;
    const averageLatency = totalOperations > 0 ? totalLatency / totalOperations : 0;
    const memoryEfficiency = totalMemoryAvailable > 0 ? totalMemoryUsed / totalMemoryAvailable : 0;

    // Calculate overall efficiency (weighted score)
    const overall = (
      hitRate * 0.4 +
      (1 - evictionRate) * 0.2 +
      (1 - stalenessRate) * 0.2 +
      (1 - Math.min(averageLatency / 1000, 1)) * 0.1 + // Normalize latency
      memoryEfficiency * 0.1
    );

    return {
      hitRate,
      missRate,
      evictionRate,
      stalenessRate,
      averageLatency,
      memoryEfficiency,
      overall
    };
  }

  private async measureMemoryUsage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Estimate memory usage
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        this.recordMetric('browser.memory.usedJSHeapSize', memoryInfo.usedJSHeapSize);
        this.recordMetric('browser.memory.totalJSHeapSize', memoryInfo.totalJSHeapSize);
        this.recordMetric('browser.memory.jsHeapSizeLimit', memoryInfo.jsHeapSizeLimit);
        
        const usagePercentage = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
        this.recordMetric('browser.memory.usagePercentage', usagePercentage);
      }

      // Estimate localStorage usage
      if (typeof localStorage !== 'undefined') {
        let localStorageSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            localStorageSize += localStorage[key].length + key.length;
          }
        }
        this.recordMetric('browser.storage.localStorageSize', localStorageSize);
      }

      // Estimate sessionStorage usage
      if (typeof sessionStorage !== 'undefined') {
        let sessionStorageSize = 0;
        for (let key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            sessionStorageSize += sessionStorage[key].length + key.length;
          }
        }
        this.recordMetric('browser.storage.sessionStorageSize', sessionStorageSize);
      }

    } catch (error) {
      this.recordMetric('browser.memory.measurementError', 1, undefined, { error: error.message });
    }
  }

  // Alert system
  private checkAlerts(): void {
    const thresholds = this.config.alerting;
    const recentMetrics = this.getRecentMetrics(60); // Last minute

    // Check hit rate
    const hitRateMetric = recentMetrics.find(m => m.name === 'cache.aggregate.hitRate');
    if (hitRateMetric && hitRateMetric.value < thresholds.hitRateThreshold) {
      this.createAlert({
        type: 'hitRate',
        severity: hitRateMetric.value < thresholds.hitRateThreshold * 0.5 ? 'critical' : 'high',
        message: `Cache hit rate dropped to ${(hitRateMetric.value * 100).toFixed(1)}%`,
        threshold: thresholds.hitRateThreshold,
        actualValue: hitRateMetric.value
      });
    }

    // Check memory usage
    const memoryMetric = recentMetrics.find(m => m.name === 'browser.memory.usagePercentage');
    if (memoryMetric && memoryMetric.value > thresholds.memoryThreshold) {
      this.createAlert({
        type: 'memory',
        severity: memoryMetric.value > 0.95 ? 'critical' : 'high',
        message: `Memory usage is at ${(memoryMetric.value * 100).toFixed(1)}%`,
        threshold: thresholds.memoryThreshold,
        actualValue: memoryMetric.value
      });
    }

    // Check latency
    const recentLatencies = this.latencyMeasurements.slice(-100);
    if (recentLatencies.length > 0) {
      const averageLatency = recentLatencies.reduce((sum, m) => sum + m.duration, 0) / recentLatencies.length;
      
      if (averageLatency > thresholds.latencyThreshold) {
        this.createAlert({
          type: 'latency',
          severity: averageLatency > thresholds.latencyThreshold * 2 ? 'high' : 'medium',
          message: `Average cache latency is ${averageLatency.toFixed(2)}ms`,
          threshold: thresholds.latencyThreshold,
          actualValue: averageLatency
        });
      }
    }
  }

  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error(`[CACHE ALERT] ${alert.message}`, alert);
    } else if (alert.severity === 'high') {
      console.warn(`[CACHE ALERT] ${alert.message}`, alert);
    } else {
      console.info(`[CACHE ALERT] ${alert.message}`, alert);
    }
  }

  // Latency monitoring
  private setupLatencyMonitoring(): void {
    // Monkey patch cache operations to measure latency
    const originalGet = cacheManager.get.bind(cacheManager);
    const originalSet = cacheManager.set.bind(cacheManager);
    const originalDelete = cacheManager.delete.bind(cacheManager);
    const originalClear = cacheManager.clear.bind(cacheManager);
    const originalHas = cacheManager.has.bind(cacheManager);

    cacheManager.get = async <T = any>(key: string, backendName?: string): Promise<T | null> => {
      const startTime = performance.now();
      try {
        const result = await originalGet<T>(key, backendName);
        this.recordLatencyMeasurement('get', backendName || 'memory', performance.now() - startTime, true, key);
        return result;
      } catch (error) {
        this.recordLatencyMeasurement('get', backendName || 'memory', performance.now() - startTime, false, key);
        throw error;
      }
    };

    cacheManager.set = async <T = any>(key: string, value: T, options?: any): Promise<boolean> => {
      const startTime = performance.now();
      try {
        const result = await originalSet<T>(key, value, options);
        this.recordLatencyMeasurement('set', options?.backend || 'memory', performance.now() - startTime, true, key);
        return result;
      } catch (error) {
        this.recordLatencyMeasurement('set', options?.backend || 'memory', performance.now() - startTime, false, key);
        throw error;
      }
    };

    cacheManager.delete = async (key: string, backendName?: string): Promise<boolean> => {
      const startTime = performance.now();
      try {
        const result = await originalDelete(key, backendName);
        this.recordLatencyMeasurement('delete', backendName || 'memory', performance.now() - startTime, true, key);
        return result;
      } catch (error) {
        this.recordLatencyMeasurement('delete', backendName || 'memory', performance.now() - startTime, false, key);
        throw error;
      }
    };

    cacheManager.clear = async (backendName?: string): Promise<void> => {
      const startTime = performance.now();
      try {
        await originalClear(backendName);
        this.recordLatencyMeasurement('clear', backendName || 'memory', performance.now() - startTime, true);
      } catch (error) {
        this.recordLatencyMeasurement('clear', backendName || 'memory', performance.now() - startTime, false);
        throw error;
      }
    };

    cacheManager.has = async (key: string, backendName?: string): Promise<boolean> => {
      const startTime = performance.now();
      try {
        const result = await originalHas(key, backendName);
        this.recordLatencyMeasurement('has', backendName || 'memory', performance.now() - startTime, true, key);
        return result;
      } catch (error) {
        this.recordLatencyMeasurement('has', backendName || 'memory', performance.now() - startTime, false, key);
        throw error;
      }
    };
  }

  private recordLatencyMeasurement(
    operation: LatencyMeasurement['operation'],
    backend: string,
    duration: number,
    success: boolean,
    key?: string
  ): void {
    if (Math.random() > this.samplingRate) return;

    const measurement: LatencyMeasurement = {
      operation,
      backend,
      duration,
      success,
      timestamp: Date.now(),
      key,
      keySize: key ? key.length : undefined
    };

    this.latencyMeasurements.push(measurement);
    
    // Keep only recent measurements
    if (this.latencyMeasurements.length > this.maxLatencyMeasurements) {
      this.latencyMeasurements = this.latencyMeasurements.slice(-this.maxLatencyMeasurements);
    }

    // Record as metric
    this.recordMetric(`cache.latency.${operation}`, duration, backend, { success });
    this.recordMetric(`cache.operations.${operation}`, 1, backend, { success });
  }

  // Public API
  recordMetric(name: string, value: number, backend?: string, metadata?: Record<string, any>): void {
    if (Math.random() > this.samplingRate) return;

    const metric: CacheMetric = {
      name,
      value,
      timestamp: Date.now(),
      backend,
      metadata
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  getMetrics(timeRange?: { start: number; end: number }, filter?: { backend?: string; name?: string }): CacheMetric[] {
    let filteredMetrics = this.metrics;

    // Apply time range filter
    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    // Apply backend filter
    if (filter?.backend) {
      filteredMetrics = filteredMetrics.filter(m => m.backend === filter.backend);
    }

    // Apply name filter
    if (filter?.name) {
      filteredMetrics = filteredMetrics.filter(m => m.name.includes(filter.name!));
    }

    return filteredMetrics;
  }

  getRecentMetrics(minutes: number): CacheMetric[] {
    const start = Date.now() - (minutes * 60 * 1000);
    return this.getMetrics({ start, end: Date.now() });
  }

  getLatencyMeasurements(timeRange?: { start: number; end: number }): LatencyMeasurement[] {
    if (!timeRange) return this.latencyMeasurements;

    return this.latencyMeasurements.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  getAlerts(includeResolved = false): PerformanceAlert[] {
    return this.alerts.filter(alert => includeResolved || !alert.resolved);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  getPerformanceReport(): {
    summary: {
      totalOperations: number;
      averageHitRate: number;
      averageLatency: number;
      errorRate: number;
      memoryUsage: number;
    };
    trends: {
      hitRateTrend: 'improving' | 'declining' | 'stable';
      latencyTrend: 'improving' | 'declining' | 'stable';
      memoryTrend: 'increasing' | 'decreasing' | 'stable';
    };
    topIssues: PerformanceAlert[];
    recommendations: string[];
  } {
    const recentMetrics = this.getRecentMetrics(60); // Last hour
    const recentLatencies = this.getLatencyMeasurements({
      start: Date.now() - 60 * 60 * 1000,
      end: Date.now()
    });

    // Calculate summary statistics
    const hitRateMetrics = recentMetrics.filter(m => m.name === 'cache.aggregate.hitRate');
    const latencyMetrics = recentMetrics.filter(m => m.name.startsWith('cache.latency.'));
    const errorMetrics = recentMetrics.filter(m => m.name.includes('error'));
    const memoryMetrics = recentMetrics.filter(m => m.name === 'browser.memory.usagePercentage');

    const averageHitRate = hitRateMetrics.length > 0 
      ? hitRateMetrics.reduce((sum, m) => sum + m.value, 0) / hitRateMetrics.length 
      : 0;

    const averageLatency = latencyMetrics.length > 0
      ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
      : 0;

    const errorRate = errorMetrics.length > 0
      ? errorMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
      : 0;

    const memoryUsage = memoryMetrics.length > 0
      ? memoryMetrics[memoryMetrics.length - 1].value
      : 0;

    // Calculate trends (simplified)
    const halfPoint = Math.floor(hitRateMetrics.length / 2);
    const firstHalfHitRate = halfPoint > 0 
      ? hitRateMetrics.slice(0, halfPoint).reduce((sum, m) => sum + m.value, 0) / halfPoint
      : 0;
    const secondHalfHitRate = halfPoint > 0
      ? hitRateMetrics.slice(halfPoint).reduce((sum, m) => sum + m.value, 0) / (hitRateMetrics.length - halfPoint)
      : 0;

    const hitRateTrend: 'improving' | 'declining' | 'stable' = 
      secondHalfHitRate > firstHalfHitRate * 1.05 ? 'improving' :
      secondHalfHitRate < firstHalfHitRate * 0.95 ? 'declining' : 'stable';

    const latencyTrend: 'improving' | 'declining' | 'stable' = 
      averageLatency < 100 ? 'stable' : 'declining';

    const memoryTrend: 'increasing' | 'decreasing' | 'stable' = 
      memoryUsage > 0.8 ? 'increasing' : memoryUsage < 0.5 ? 'decreasing' : 'stable';

    // Get top issues
    const activeAlerts = this.getAlerts(false)
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 5);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageHitRate < 0.8) {
      recommendations.push('Consider increasing cache TTL or cache size to improve hit rate');
    }
    
    if (averageLatency > 100) {
      recommendations.push('Cache operations are slow - consider using memory cache instead of localStorage');
    }
    
    if (memoryUsage > 0.8) {
      recommendations.push('High memory usage detected - consider reducing cache size or implementing cleanup');
    }
    
    if (errorRate > 0.01) {
      recommendations.push('High error rate detected - check cache backend availability and configuration');
    }

    return {
      summary: {
        totalOperations: recentMetrics.length,
        averageHitRate,
        averageLatency,
        errorRate,
        memoryUsage
      },
      trends: {
        hitRateTrend,
        latencyTrend,
        memoryTrend
      },
      topIssues: activeAlerts,
      recommendations
    };
  }

  private cleanupOldData(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Clean up old metrics
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    // Clean up old latency measurements
    this.latencyMeasurements = this.latencyMeasurements.filter(m => m.timestamp > cutoff);
    
    // Clean up resolved alerts older than 1 week
    const weekCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => !a.resolved || a.timestamp > weekCutoff);
  }

  // Export/import functionality
  exportData(): string {
    return JSON.stringify({
      metrics: this.metrics.slice(-1000), // Last 1000 metrics
      latencyMeasurements: this.latencyMeasurements.slice(-1000),
      alerts: this.alerts,
      config: this.config,
      exportedAt: Date.now()
    }, null, 2);
  }

  importData(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      
      if (imported.metrics) {
        this.metrics = [...this.metrics, ...imported.metrics].slice(-this.maxMetricsHistory);
      }
      
      if (imported.latencyMeasurements) {
        this.latencyMeasurements = [...this.latencyMeasurements, ...imported.latencyMeasurements].slice(-this.maxLatencyMeasurements);
      }
      
      if (imported.alerts) {
        this.alerts = [...this.alerts, ...imported.alerts].slice(-1000);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import cache monitoring data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cacheMonitoring = new CacheMonitoringService();

// React hook for monitoring data
export function useCacheMonitoring() {
  const [metrics, setMetrics] = useState<CacheMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [performanceReport, setPerformanceReport] = useState<any>(null);

  useEffect(() => {
    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(cacheMonitoring.getRecentMetrics(30)); // Last 30 minutes
      setAlerts(cacheMonitoring.getAlerts());
      setPerformanceReport(cacheMonitoring.getPerformanceReport());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    alerts,
    performanceReport,
    recordMetric: cacheMonitoring.recordMetric.bind(cacheMonitoring),
    resolveAlert: cacheMonitoring.resolveAlert.bind(cacheMonitoring)
  };
}