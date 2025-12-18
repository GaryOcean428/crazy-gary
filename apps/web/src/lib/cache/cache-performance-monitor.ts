/**
 * Advanced Cache Performance Monitoring and Analytics
 * Provides comprehensive monitoring, alerting, and performance optimization recommendations
 */

import { cache } from './cache-manager';
import { CacheStats } from './cache-types';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface CachePerformanceReport {
  summary: {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
    averageLatency: number;
    memoryUsage: number;
    storageUsage: number;
    efficiency: number;
  };
  trends: {
    hitRateTrend: 'improving' | 'stable' | 'declining';
    latencyTrend: 'improving' | 'stable' | 'declining';
    memoryTrend: 'stable' | 'increasing' | 'critical';
  };
  alerts: PerformanceAlert[];
  recommendations: PerformanceRecommendation[];
  detailed: {
    byCacheType: Record<string, CacheStats>;
    byOperation: Record<string, OperationStats>;
    byTimeSlot: TimeSlotStats[];
  };
}

export interface PerformanceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'hit_rate' | 'latency' | 'memory' | 'errors' | 'storage';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceRecommendation {
  id: string;
  category: 'optimization' | 'configuration' | 'maintenance' | 'architecture';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface OperationStats {
  operation: string;
  count: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  throughput: number;
}

export interface TimeSlotStats {
  timeSlot: string;
  requests: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageLatency: number;
  errors: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  samplingRate: number; // 0-1, percentage of operations to sample
  alertThresholds: {
    hitRateMin: number;
    latencyMax: number;
    memoryUsageMax: number;
    errorRateMax: number;
  };
  retentionPeriod: number; // hours
  realTimeAlerts: boolean;
  autoOptimization: boolean;
}

export class CachePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private operationLatencies: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private requestCounts: Map<string, number> = new Map();
  private config: MonitoringConfig;
  private alerts: PerformanceAlert[] = [];
  private recommendations: PerformanceRecommendation[] = [];
  private isMonitoring = false;
  private cleanupInterval?: number;

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      enabled: true,
      samplingRate: 0.1, // Sample 10% of operations
      alertThresholds: {
        hitRateMin: 0.7, // 70% minimum hit rate
        latencyMax: 1000, // 1 second max latency
        memoryUsageMax: 0.8, // 80% max memory usage
        errorRateMax: 0.05 // 5% max error rate
      },
      retentionPeriod: 24, // 24 hours
      realTimeAlerts: true,
      autoOptimization: false,
      ...config
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Start periodic cleanup and analysis
    this.cleanupInterval = window.setInterval(() => {
      this.performPeriodicMaintenance();
    }, 5 * 60 * 1000); // Every 5 minutes

    console.log('Cache performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    console.log('Cache performance monitoring stopped');
  }

  /**
   * Record a cache operation
   */
  recordOperation(
    operation: string,
    cacheType: string,
    success: boolean,
    latency: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldSample()) return;

    const timestamp = Date.now();
    
    // Record latency
    if (!this.operationLatencies.has(operation)) {
      this.operationLatencies.set(operation, []);
    }
    this.operationLatencies.get(operation)!.push(latency);

    // Record counts
    const successKey = `${operation}_success`;
    const errorKey = `${operation}_error`;
    
    this.requestCounts.set(operation, (this.requestCounts.get(operation) || 0) + 1);
    
    if (success) {
      this.requestCounts.set(successKey, (this.requestCounts.get(successKey) || 0) + 1);
    } else {
      this.requestCounts.set(errorKey, (this.requestCounts.get(errorKey) || 0) + 1);
    }

    // Record metric
    this.recordMetric({
      name: `cache.${operation}`,
      value: success ? 1 : 0,
      unit: 'success',
      timestamp,
      tags: { cacheType, operation },
      metadata
    });

    this.recordMetric({
      name: `cache.latency`,
      value: latency,
      unit: 'ms',
      timestamp,
      tags: { cacheType, operation }
    });

    // Check for real-time alerts
    if (this.config.realTimeAlerts) {
      this.checkRealTimeAlerts(operation, cacheType, success, latency);
    }
  }

  /**
   * Generate comprehensive performance report
   */
  async generateReport(): Promise<CachePerformanceReport> {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => 
      now - m.timestamp < this.config.retentionPeriod * 60 * 60 * 1000
    );

    const summary = await this.generateSummary(recentMetrics);
    const trends = this.analyzeTrends(recentMetrics);
    const alerts = this.generateAlerts(summary);
    const recommendations = this.generateRecommendations(summary, trends);
    const detailed = await this.generateDetailedStats();

    return {
      summary,
      trends,
      alerts,
      recommendations,
      detailed
    };
  }

  /**
   * Generate summary statistics
   */
  private async generateSummary(metrics: PerformanceMetric[]): Promise<CachePerformanceReport['summary']> {
    const cacheOperations = metrics.filter(m => m.name.startsWith('cache.'));
    const successMetrics = cacheOperations.filter(m => m.unit === 'success');
    
    const totalRequests = successMetrics.length;
    const cacheHits = successMetrics.filter(m => m.value === 1).length;
    const cacheMisses = totalRequests - cacheHits;
    
    const latencyMetrics = cacheOperations.filter(m => m.unit === 'ms');
    const averageLatency = latencyMetrics.length > 0
      ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
      : 0;

    // Get storage usage
    const storageStats = await this.getStorageStats();
    
    // Calculate efficiency score
    const efficiency = this.calculateEfficiencyScore({
      hitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      averageLatency,
      memoryUsage: storageStats.memoryUsage,
      errorRate: this.calculateErrorRate()
    });

    return {
      totalRequests,
      cacheHits,
      cacheMisses,
      hitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      averageLatency,
      memoryUsage: storageStats.memoryUsage,
      storageUsage: storageStats.totalSize,
      efficiency
    };
  }

  /**
   * Analyze performance trends
   */
  private analyzeTrends(metrics: PerformanceMetric[]): CachePerformanceReport['trends'] {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentMetrics = metrics.filter(m => m.timestamp > oneHourAgo);
    
    // Analyze hit rate trend
    const hitRateTrend = this.analyzeHitRateTrend(recentMetrics);
    
    // Analyze latency trend
    const latencyTrend = this.analyzeLatencyTrend(recentMetrics);
    
    // Analyze memory trend
    const memoryTrend = this.analyzeMemoryTrend();

    return {
      hitRateTrend,
      latencyTrend,
      memoryTrend
    };
  }

  /**
   * Generate performance alerts
   */
  private generateAlerts(summary: CachePerformanceReport['summary']): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    const now = Date.now();

    // Hit rate alert
    if (summary.hitRate < this.config.alertThresholds.hitRateMin) {
      alerts.push({
        id: `hit_rate_${now}`,
        severity: summary.hitRate < this.config.alertThresholds.hitRateMin * 0.5 ? 'critical' : 'high',
        type: 'hit_rate',
        message: `Cache hit rate is ${(summary.hitRate * 100).toFixed(1)}%, below threshold of ${(this.config.alertThresholds.hitRateMin * 100)}%`,
        currentValue: summary.hitRate,
        threshold: this.config.alertThresholds.hitRateMin,
        timestamp: now,
        resolved: false
      });
    }

    // Latency alert
    if (summary.averageLatency > this.config.alertThresholds.latencyMax) {
      alerts.push({
        id: `latency_${now}`,
        severity: summary.averageLatency > this.config.alertThresholds.latencyMax * 2 ? 'critical' : 'medium',
        type: 'latency',
        message: `Average cache latency is ${summary.averageLatency.toFixed(0)}ms, above threshold of ${this.config.alertThresholds.latencyMax}ms`,
        currentValue: summary.averageLatency,
        threshold: this.config.alertThresholds.latencyMax,
        timestamp: now,
        resolved: false
      });
    }

    // Memory usage alert
    if (summary.memoryUsage > this.config.alertThresholds.memoryUsageMax) {
      alerts.push({
        id: `memory_${now}`,
        severity: summary.memoryUsage > 0.95 ? 'critical' : 'high',
        type: 'memory',
        message: `Cache memory usage is ${(summary.memoryUsage * 100).toFixed(1)}%, above threshold of ${(this.config.alertThresholds.memoryUsageMax * 100)}%`,
        currentValue: summary.memoryUsage,
        threshold: this.config.alertThresholds.memoryUsageMax,
        timestamp: now,
        resolved: false
      });
    }

    return alerts;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    summary: CachePerformanceReport['summary'],
    trends: CachePerformanceReport['trends']
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // Hit rate recommendations
    if (summary.hitRate < 0.8) {
      recommendations.push({
        id: 'improve_hit_rate',
        category: 'optimization',
        priority: 'high',
        title: 'Improve Cache Hit Rate',
        description: 'Current hit rate is below optimal. Consider increasing TTL values or pre-loading frequently accessed data.',
        impact: 'Could improve response times by 50-80%',
        effort: 'medium',
        actionItems: [
          'Review and increase TTL for stable data',
          'Implement cache warming for critical resources',
          'Analyze access patterns to optimize cache keys',
          'Consider using larger cache sizes'
        ]
      });
    }

    // Latency recommendations
    if (summary.averageLatency > 500) {
      recommendations.push({
        id: 'reduce_latency',
        category: 'optimization',
        priority: 'medium',
        title: 'Reduce Cache Latency',
        description: 'Cache operations are taking longer than optimal. Consider optimizing cache backend performance.',
        impact: 'Could reduce response times by 20-40%',
        effort: 'low',
        actionItems: [
          'Consider switching to faster cache backend (memory vs localStorage)',
          'Optimize serialization/deserialization processes',
          'Reduce cache entry sizes',
          'Implement connection pooling for external caches'
        ]
      });
    }

    // Memory usage recommendations
    if (summary.memoryUsage > 0.7) {
      recommendations.push({
        id: 'manage_memory',
        category: 'maintenance',
        priority: 'medium',
        title: 'Optimize Memory Usage',
        description: 'Cache is using significant memory. Consider implementing cleanup strategies.',
        impact: 'Could free up 30-50% memory',
        effort: 'low',
        actionItems: [
          'Implement LRU eviction policies',
          'Set maximum cache size limits',
          'Clear expired entries regularly',
          'Consider using compression for large objects'
        ]
      });
    }

    // Architecture recommendations
    if (trends.hitRateTrend === 'declining') {
      recommendations.push({
        id: 'architecture_review',
        category: 'architecture',
        priority: 'high',
        title: 'Review Cache Architecture',
        description: 'Cache hit rate is declining over time. Consider architectural changes.',
        impact: 'Could restore and improve performance',
        effort: 'high',
        actionItems: [
          'Review cache invalidation strategies',
          'Consider multi-layer caching approach',
          'Evaluate cache backend selection',
          'Implement cache partitioning strategies'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate detailed statistics
   */
  private async generateDetailedStats(): Promise<CachePerformanceReport['detailed']> {
    const byCacheType = await this.getStatsByCacheType();
    const byOperation = this.getStatsByOperation();
    const byTimeSlot = this.getStatsByTimeSlot();

    return {
      byCacheType,
      byOperation,
      byTimeSlot
    };
  }

  /**
   * Get statistics by cache type
   */
  private async getStatsByCacheType(): Promise<Record<string, CacheStats>> {
    const cacheTypes = ['memory', 'localStorage', 'sessionStorage', 'indexedDB'];
    const stats: Record<string, CacheStats> = {};

    for (const cacheType of cacheTypes) {
      try {
        const cache = this.getCacheBackend(cacheType);
        if (cache) {
          stats[cacheType] = await cache.stats();
        }
      } catch (error) {
        // Cache type not available
      }
    }

    return stats;
  }

  /**
   * Get statistics by operation
   */
  private getStatsByOperation(): Record<string, OperationStats> {
    const stats: Record<string, OperationStats> = {};
    
    for (const [operation, latencies] of this.operationLatencies.entries()) {
      const requestCount = this.requestCounts.get(operation) || 0;
      const errorCount = this.errorCounts.get(operation) || 0;
      
      if (latencies.length > 0) {
        latencies.sort((a, b) => a - b);
        const p50 = latencies[Math.floor(latencies.length * 0.5)];
        const p95 = latencies[Math.floor(latencies.length * 0.95)];
        const p99 = latencies[Math.floor(latencies.length * 0.99)];
        
        stats[operation] = {
          operation,
          count: requestCount,
          averageLatency: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
          p50Latency: p50,
          p95Latency: p95,
          p99Latency: p99,
          errorRate: requestCount > 0 ? errorCount / requestCount : 0,
          throughput: requestCount / (5 * 60) // Requests per minute over last 5 minutes
        };
      }
    }

    return stats;
  }

  /**
   * Get statistics by time slot
   */
  private getStatsByTimeSlot(): TimeSlotStats[] {
    const timeSlots: TimeSlotStats[] = [];
    const now = Date.now();
    const slotSize = 15 * 60 * 1000; // 15 minutes

    for (let i = 0; i < 24 * 4; i++) { // 24 hours in 15-minute slots
      const slotStart = now - (i + 1) * slotSize;
      const slotEnd = now - i * slotSize;
      const slotMetrics = this.metrics.filter(m => 
        m.timestamp >= slotStart && m.timestamp < slotEnd && 
        m.name.startsWith('cache.')
      );

      const successMetrics = slotMetrics.filter(m => m.unit === 'success');
      const requests = successMetrics.length;
      const hits = successMetrics.filter(m => m.value === 1).length;
      const misses = requests - hits;
      const latencyMetrics = slotMetrics.filter(m => m.unit === 'ms');
      const avgLatency = latencyMetrics.length > 0
        ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
        : 0;

      timeSlots.unshift({
        timeSlot: new Date(slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requests,
        hits,
        misses,
        hitRate: requests > 0 ? hits / requests : 0,
        averageLatency: avgLatency,
        errors: slotMetrics.filter(m => m.value === 0).length
      });
    }

    return timeSlots;
  }

  /**
   * Utility methods
   */
  private shouldSample(): boolean {
    return this.isMonitoring && Math.random() < this.config.samplingRate;
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Cleanup old metrics
    const cutoff = Date.now() - (this.config.retentionPeriod * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  private async getStorageStats(): Promise<{ memoryUsage: number; totalSize: number }> {
    try {
      // Estimate memory usage based on metrics
      const totalSize = this.metrics.reduce((sum, m) => sum + JSON.stringify(m).length, 0);
      const estimatedMemoryUsage = totalSize / (50 * 1024 * 1024); // Assume 50MB available
      
      return {
        memoryUsage: Math.min(estimatedMemoryUsage, 1),
        totalSize
      };
    } catch {
      return { memoryUsage: 0, totalSize: 0 };
    }
  }

  private calculateEfficiencyScore(metrics: {
    hitRate: number;
    averageLatency: number;
    memoryUsage: number;
    errorRate: number;
  }): number {
    const hitRateScore = metrics.hitRate * 0.4;
    const latencyScore = Math.max(0, 1 - metrics.averageLatency / 1000) * 0.3;
    const memoryScore = Math.max(0, 1 - metrics.memoryUsage) * 0.2;
    const errorScore = Math.max(0, 1 - metrics.errorRate) * 0.1;
    
    return hitRateScore + latencyScore + memoryScore + errorScore;
  }

  private calculateErrorRate(): number {
    let totalRequests = 0;
    let totalErrors = 0;
    
    for (const [key, count] of this.requestCounts.entries()) {
      if (key.endsWith('_success') || key.endsWith('_error')) {
        totalRequests += count;
        if (key.endsWith('_error')) {
          totalErrors += count;
        }
      }
    }
    
    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }

  private analyzeHitRateTrend(metrics: PerformanceMetric[]): 'improving' | 'stable' | 'declining' {
    // Simplified trend analysis
    const successMetrics = metrics.filter(m => m.unit === 'success');
    if (successMetrics.length < 2) return 'stable';
    
    // Compare first and last quarters
    const firstQuarter = successMetrics.slice(0, Math.floor(successMetrics.length / 4));
    const lastQuarter = successMetrics.slice(-Math.floor(successMetrics.length / 4));
    
    const firstHitRate = firstQuarter.filter(m => m.value === 1).length / firstQuarter.length;
    const lastHitRate = lastQuarter.filter(m => m.value === 1).length / lastQuarter.length;
    
    const change = lastHitRate - firstHitRate;
    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  private analyzeLatencyTrend(metrics: PerformanceMetric[]): 'improving' | 'stable' | 'declining' {
    const latencyMetrics = metrics.filter(m => m.unit === 'ms');
    if (latencyMetrics.length < 2) return 'stable';
    
    const firstQuarter = latencyMetrics.slice(0, Math.floor(latencyMetrics.length / 4));
    const lastQuarter = latencyMetrics.slice(-Math.floor(latencyMetrics.length / 4));
    
    const firstAvg = firstQuarter.reduce((sum, m) => sum + m.value, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((sum, m) => sum + m.value, 0) / lastQuarter.length;
    
    const change = lastAvg - firstAvg;
    if (change < -50) return 'improving'; // Latency decreased
    if (change > 50) return 'declining'; // Latency increased
    return 'stable';
  }

  private analyzeMemoryTrend(): 'stable' | 'increasing' | 'critical' {
    // Simplified memory trend analysis
    const recentMetrics = this.metrics.slice(-100);
    const memoryMetrics = recentMetrics.filter(m => m.name === 'memory.usage');
    
    if (memoryMetrics.length < 2) return 'stable';
    
    const avgMemory = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length;
    
    if (avgMemory > 0.9) return 'critical';
    if (avgMemory > 0.7) return 'increasing';
    return 'stable';
  }

  private checkRealTimeAlerts(operation: string, cacheType: string, success: boolean, latency: number): void {
    // Check for immediate performance issues
    if (!success) {
      this.createAlert('errors', 'medium', `Cache operation failed: ${operation}`, 0, 0);
    }
    
    if (latency > 2000) { // 2 seconds
      this.createAlert('latency', 'high', `Slow cache operation: ${operation}`, latency, 2000);
    }
  }

  private createAlert(type: PerformanceAlert['type'], severity: PerformanceAlert['severity'], message: string, currentValue: number, threshold: number): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random()}`,
      severity,
      type,
      message,
      currentValue,
      threshold,
      timestamp: Date.now(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Keep only recent alerts
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
    
    console.warn('Cache Performance Alert:', alert);
  }

  private async performPeriodicMaintenance(): Promise<void> {
    // Clean up old data
    const cutoff = Date.now() - (this.config.retentionPeriod * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    // Generate new recommendations
    const report = await this.generateReport();
    this.recommendations = report.recommendations;
  }

  private getCacheBackend(name: string): any {
    // This would return the actual cache backend instances
    // For now, return null as they're managed elsewhere
    return null;
  }

  /**
   * Public API
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(a => !a.resolved);
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      operationLatencies: Object.fromEntries(this.operationLatencies),
      requestCounts: Object.fromEntries(this.requestCounts),
      errorCounts: Object.fromEntries(this.errorCounts),
      config: this.config
    }, null, 2);
  }
}

// Export singleton instance
export const cachePerformanceMonitor = new CachePerformanceMonitor();

// Export React hook for easy integration
export function useCachePerformanceMonitoring() {
  return {
    recordOperation: cachePerformanceMonitor.recordOperation.bind(cachePerformanceMonitor),
    generateReport: () => cachePerformanceMonitor.generateReport(),
    getAlerts: () => cachePerformanceMonitor.getAlerts(),
    resolveAlert: (id: string) => cachePerformanceMonitor.resolveAlert(id),
    getConfig: () => cachePerformanceMonitor.getConfig(),
    updateConfig: (config: Partial<MonitoringConfig>) => 
      cachePerformanceMonitor.updateConfig(config),
    startMonitoring: () => cachePerformanceMonitor.startMonitoring(),
    stopMonitoring: () => cachePerformanceMonitor.stopMonitoring()
  };
}