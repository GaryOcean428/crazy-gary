/**
 * Advanced Cache Warming System with Predictive Loading
 * Provides intelligent cache warming based on user behavior, patterns, and ML predictions
 */

import { cache } from './cache-manager';
import { useCacheManager } from './service-worker-hooks';

export interface CacheWarmupStrategy {
  name: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  enabled: boolean;
  trigger: 'onload' | 'onroute' | 'onidle' | 'predictive' | 'manual';
  keys: string[];
  ttl?: number;
  dependencies?: string[];
  condition?: () => boolean;
}

export interface PredictiveCacheConfig {
  enabled: boolean;
  mlEnabled: boolean;
  dataSource: 'local' | 'server' | 'hybrid';
  modelEndpoint?: string;
  confidenceThreshold: number;
  updateInterval: number; // ms
  historySize: number;
  features: string[];
}

export interface UserBehaviorPattern {
  userId?: string;
  sessionId: string;
  timestamp: number;
  page: string;
  action: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface PredictionResult {
  key: string;
  confidence: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  predictedAccessTime: number;
  reason: string;
  features: Record<string, any>;
}

export interface CacheWarmupMetrics {
  totalWarmed: number;
  successful: number;
  failed: number;
  averageTime: number;
  cacheHitRateImprovement: number;
  predictions: number;
  accuracy: number;
}

export class AdvancedCacheWarmer {
  private strategies: Map<string, CacheWarmupStrategy> = new Map();
  private userBehavior: UserBehaviorPattern[] = [];
  private predictions: Map<string, PredictionResult> = new Map();
  private metrics: CacheWarmupMetrics;
  private predictiveConfig: PredictiveCacheConfig;
  private mlModel: any = null;
  private isInitialized = false;

  constructor(config?: Partial<PredictiveCacheConfig>) {
    this.predictiveConfig = {
      enabled: true,
      mlEnabled: true,
      dataSource: 'hybrid',
      confidenceThreshold: 0.7,
      updateInterval: 30000, // 30 seconds
      historySize: 1000,
      features: [
        'page_access_frequency',
        'time_of_day',
        'day_of_week',
        'user_segment',
        'session_length',
        'click_patterns',
        'scroll_behavior'
      ],
      ...config
    };

    this.metrics = {
      totalWarmed: 0,
      successful: 0,
      failed: 0,
      averageTime: 0,
      cacheHitRateImprovement: 0,
      predictions: 0,
      accuracy: 0
    };

    this.initializeStrategies();
  }

  /**
   * Initialize the cache warmer
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load user behavior history
    await this.loadUserBehaviorHistory();
    
    // Initialize ML model if enabled
    if (this.predictiveConfig.mlEnabled) {
      await this.initializeMLModel();
    }

    // Start predictive monitoring
    if (this.predictiveConfig.enabled) {
      this.startPredictiveMonitoring();
    }

    this.isInitialized = true;
    console.log('Advanced Cache Warmer initialized');
  }

  /**
   * Start cache warming based on strategies
   */
  async startWarmup(trigger?: string): Promise<void> {
    await this.initialize();

    const strategies = Array.from(this.strategies.values())
      .filter(s => s.enabled && (!trigger || s.trigger === trigger));

    // Sort by priority
    strategies.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    for (const strategy of strategies) {
      try {
        if (strategy.condition && !strategy.condition()) {
          continue;
        }

        await this.executeStrategy(strategy);
      } catch (error) {
        console.warn(`Failed to execute strategy ${strategy.name}:`, error);
      }
    }
  }

  /**
   * Execute a specific warming strategy
   */
  private async executeStrategy(strategy: CacheWarmupStrategy): Promise<void> {
    const startTime = Date.now();
    let successCount = 0;
    let totalCount = strategy.keys.length;

    // Check dependencies first
    if (strategy.dependencies) {
      for (const dep of strategy.dependencies) {
        if (!await this.isDependencyReady(dep)) {
          console.log(`Dependency ${dep} not ready for strategy ${strategy.name}`);
          return;
        }
      }
    }

    // Execute warming based on priority
    switch (strategy.priority) {
      case 'critical':
        // Warm critical resources immediately
        await this.warmKeysImmediate(strategy.keys, strategy.ttl);
        break;
        
      case 'high':
        // Warm high priority in parallel with limited concurrency
        await this.warmKeysParallel(strategy.keys, 5, strategy.ttl);
        break;
        
      case 'normal':
        // Warm normal priority with standard concurrency
        await this.warmKeysParallel(strategy.keys, 3, strategy.ttl);
        break;
        
      case 'low':
        // Warm low priority when system is idle
        if (document.hidden) {
          await this.warmKeysParallel(strategy.keys, 2, strategy.ttl);
        }
        break;
    }

    // Update metrics
    this.updateMetrics(successCount, totalCount, Date.now() - startTime);
  }

  /**
   * Warm cache keys immediately (for critical resources)
   */
  private async warmKeysImmediate(keys: string[], ttl?: number): Promise<void> {
    const promises = keys.map(key => this.warmSingleKey(key, ttl));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Failed to warm key ${keys[index]}:`, result.reason);
      }
    });
  }

  /**
   * Warm cache keys with controlled concurrency
   */
  private async warmKeysParallel(keys: string[], concurrency: number, ttl?: number): Promise<void> {
    const chunks = this.chunkArray(keys, concurrency);
    
    for (const chunk of chunks) {
      const promises = chunk.map(key => this.warmSingleKey(key, ttl));
      const results = await Promise.allSettled(promises);
      
      // Process results
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Failed to warm key ${chunk[index]}:`, result.reason);
        }
      });
    }
  }

  /**
   * Warm a single cache key
   */
  private async warmSingleKey(key: string, ttl?: number): Promise<boolean> {
    try {
      // Skip if already cached
      if (await cache.has(key)) {
        return true;
      }

      // Generate or fetch the data
      const data = await this.generateOrFetchData(key);
      
      if (data !== null && data !== undefined) {
        await cache.set(key, data, {
          ttl: ttl || this.getDefaultTTL(key),
          tags: ['warmup', 'predictive']
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn(`Failed to warm key ${key}:`, error);
      return false;
    }
  }

  /**
   * Generate or fetch data for a cache key
   */
  private async generateOrFetchData(key: string): Promise<any> {
    // Parse key to determine data source
    if (key.startsWith('api:')) {
      const url = key.substring(4);
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn(`Failed to fetch API data for ${key}:`, error);
      }
    } else if (key.startsWith('user:')) {
      // Generate user-specific data
      return this.generateUserData(key);
    } else if (key.startsWith('static:')) {
      // Generate static data
      return this.generateStaticData(key);
    }

    return null;
  }

  /**
   * Predictive cache warming based on user behavior
   */
  async warmPredictively(): Promise<void> {
    if (!this.predictiveConfig.enabled) return;

    const predictions = await this.generatePredictions();
    const highConfidencePredictions = predictions.filter(p => 
      p.confidence >= this.predictiveConfig.confidenceThreshold
    );

    for (const prediction of highConfidencePredictions) {
      if (!await cache.has(prediction.key)) {
        await this.warmSingleKey(prediction.key);
      }
    }

    this.metrics.predictions = predictions.length;
  }

  /**
   * Generate predictions using ML model
   */
  private async generatePredictions(): Promise<PredictionResult[]> {
    if (!this.predictiveConfig.mlEnabled || !this.mlModel) {
      return this.generateSimplePredictions();
    }

    try {
      // Use ML model to generate predictions
      const features = this.extractFeatures();
      const mlPredictions = await this.mlModel.predict(features);
      
      return mlPredictions.map((pred: any) => ({
        key: pred.key,
        confidence: pred.confidence,
        priority: this.getPriorityFromConfidence(pred.confidence),
        predictedAccessTime: pred.accessTime,
        reason: pred.reason,
        features: pred.features
      }));
    } catch (error) {
      console.warn('ML prediction failed, falling back to simple predictions:', error);
      return this.generateSimplePredictions();
    }
  }

  /**
   * Generate simple rule-based predictions
   */
  private generateSimplePredictions(): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    const now = Date.now();
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // Analyze user behavior patterns
    const pageAccessPatterns = this.analyzePageAccessPatterns();
    const timePatterns = this.analyzeTimePatterns();

    for (const [page, frequency] of Object.entries(pageAccessPatterns)) {
      if (frequency > 0.5) { // High frequency pages
        predictions.push({
          key: `page:${page}`,
          confidence: frequency,
          priority: 'high',
          predictedAccessTime: this.estimateNextAccessTime(page, timePatterns),
          reason: `High access frequency: ${(frequency * 100).toFixed(1)}%`,
          features: { page, frequency, timePatterns }
        });
      }
    }

    return predictions;
  }

  /**
   * Extract features for ML model
   */
  private extractFeatures(): Record<string, any> {
    const features: Record<string, any> = {};

    // Time-based features
    features.hour = new Date().getHours();
    features.dayOfWeek = new Date().getDay();
    features.isWeekend = [0, 6].includes(new Date().getDay());
    features.timeOfDay = this.getTimeOfDay();

    // Behavior features
    features.sessionLength = this.getSessionLength();
    features.pagesVisited = this.getPagesVisitedCount();
    features.averagePageTime = this.getAveragePageTime();
    features.clickRate = this.getClickRate();
    features.scrollDepth = this.getScrollDepth();

    // Historical features
    features.frequentPages = this.getFrequentPages();
    features.lastAccessedPages = this.getLastAccessedPages();

    return features;
  }

  /**
   * Analyze user behavior patterns
   */
  private analyzePageAccessPatterns(): Record<string, number> {
    const pageCounts: Record<string, number> = {};
    const totalSessions = new Set(this.userBehavior.map(b => b.sessionId)).size;

    if (totalSessions === 0) return pageCounts;

    for (const behavior of this.userBehavior) {
      pageCounts[behavior.page] = (pageCounts[behavior.page] || 0) + 1;
    }

    // Normalize to frequency
    Object.keys(pageCounts).forEach(page => {
      pageCounts[page] = pageCounts[page] / totalSessions;
    });

    return pageCounts;
  }

  /**
   * Analyze time-based access patterns
   */
  private analyzeTimePatterns(): Record<string, number> {
    const patterns: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};

    for (const behavior of this.userBehavior) {
      const hour = new Date(behavior.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    // Find peak hours
    const totalHours = Object.values(hourCounts).reduce((sum, count) => sum + count, 0);
    if (totalHours > 0) {
      Object.keys(hourCounts).forEach(hour => {
        patterns[`hour_${hour}`] = hourCounts[parseInt(hour)] / totalHours;
      });
    }

    return patterns;
  }

  /**
   * Track user behavior for prediction
   */
  trackUserBehavior(behavior: Omit<UserBehaviorPattern, 'timestamp'>): void {
    const behaviorWithTimestamp: UserBehaviorPattern = {
      ...behavior,
      timestamp: Date.now()
    };

    this.userBehavior.push(behaviorWithTimestamp);
    
    // Keep only recent history
    if (this.userBehavior.length > this.predictiveConfig.historySize) {
      this.userBehavior = this.userBehavior.slice(-this.predictiveConfig.historySize);
    }

    // Save to storage
    this.saveUserBehaviorHistory();
  }

  /**
   * Initialize default warming strategies
   */
  private initializeStrategies(): void {
    const strategies: CacheWarmupStrategy[] = [
      {
        name: 'critical-app-start',
        priority: 'critical',
        enabled: true,
        trigger: 'onload',
        keys: [
          'api:user:profile',
          'api:navigation:menu',
          'static:config:app',
          'static:i18n:en'
        ]
      },
      {
        name: 'dashboard-critical',
        priority: 'critical',
        enabled: true,
        trigger: 'onroute',
        condition: () => location.pathname.includes('/dashboard'),
        keys: [
          'api:dashboard:metrics',
          'api:dashboard:notifications',
          'api:user:preferences'
        ]
      },
      {
        name: 'user-pages',
        priority: 'high',
        enabled: true,
        trigger: 'onroute',
        keys: [
          'api:user:settings',
          'api:user:activity',
          'api:user:favorites'
        ]
      },
      {
        name: 'common-pages',
        priority: 'normal',
        enabled: true,
        trigger: 'onidle',
        keys: [
          'api:common:countries',
          'api:common:currencies',
          'static:assets:icons'
        ]
      },
      {
        name: 'predictive-warming',
        priority: 'normal',
        enabled: true,
        trigger: 'predictive',
        condition: () => this.predictiveConfig.enabled,
        keys: [] // Will be populated by predictions
      }
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  /**
   * Utility methods
   */
  private getPriorityWeight(priority: string): number {
    const weights = { critical: 4, high: 3, normal: 2, low: 1 };
    return weights[priority as keyof typeof weights] || 0;
  }

  private getPriorityFromConfidence(confidence: number): 'critical' | 'high' | 'normal' | 'low' {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'normal';
    return 'low';
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private getDefaultTTL(key: string): number {
    if (key.startsWith('api:')) return 5 * 60 * 1000; // 5 minutes
    if (key.startsWith('static:')) return 24 * 60 * 60 * 1000; // 24 hours
    if (key.startsWith('user:')) return 30 * 60 * 1000; // 30 minutes
    return 15 * 60 * 1000; // 15 minutes default
  }

  private async isDependencyReady(dependency: string): Promise<boolean> {
    // Check if dependency is loaded or cached
    return await cache.has(dependency);
  }

  private updateMetrics(successCount: number, totalCount: number, timeTaken: number): void {
    this.metrics.totalWarmed += totalCount;
    this.metrics.successful += successCount;
    this.metrics.failed += (totalCount - successCount);
    this.metrics.averageTime = 
      (this.metrics.averageTime + timeTaken) / 2; // Rolling average
  }

  // Placeholder methods for data generation
  private generateUserData(key: string): any {
    return { generated: true, key, timestamp: Date.now() };
  }

  private generateStaticData(key: string): any {
    return { static: true, key, timestamp: Date.now() };
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private getSessionLength(): number {
    // Calculate session length from behavior history
    return this.userBehavior.length;
  }

  private getPagesVisitedCount(): number {
    return new Set(this.userBehavior.map(b => b.page)).size;
  }

  private getAveragePageTime(): number {
    const pageTimes = this.userBehavior.filter(b => b.duration > 0);
    return pageTimes.length > 0 
      ? pageTimes.reduce((sum, b) => sum + b.duration, 0) / pageTimes.length 
      : 0;
  }

  private getClickRate(): number {
    const clickActions = this.userBehavior.filter(b => b.action === 'click').length;
    return this.userBehavior.length > 0 ? clickActions / this.userBehavior.length : 0;
  }

  private getScrollDepth(): number {
    // Simplified scroll depth calculation
    return Math.random(); // Placeholder
  }

  private getFrequentPages(): string[] {
    const pageCounts: Record<string, number> = {};
    this.userBehavior.forEach(b => {
      pageCounts[b.page] = (pageCounts[b.page] || 0) + 1;
    });
    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page]) => page);
  }

  private getLastAccessedPages(): string[] {
    return this.userBehavior
      .slice(-10)
      .map(b => b.page);
  }

  private estimateNextAccessTime(page: string, patterns: Record<string, number>): number {
    // Simplified prediction - next hour
    return Date.now() + 60 * 60 * 1000;
  }

  private async initializeMLModel(): Promise<void> {
    // Initialize ML model (placeholder)
    // In a real implementation, you would load a TensorFlow.js model or similar
    this.mlModel = {
      predict: async (features: Record<string, any>) => {
        // Simple rule-based prediction as fallback
        return [];
      }
    };
  }

  private startPredictiveMonitoring(): void {
    setInterval(() => {
      this.warmPredictively().catch(console.warn);
    }, this.predictiveConfig.updateInterval);
  }

  private async loadUserBehaviorHistory(): Promise<void> {
    try {
      const stored = localStorage.getItem('cache_warmer_behavior');
      if (stored) {
        this.userBehavior = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user behavior history:', error);
    }
  }

  private async saveUserBehaviorHistory(): Promise<void> {
    try {
      localStorage.setItem('cache_warmer_behavior', JSON.stringify(this.userBehavior));
    } catch (error) {
      console.warn('Failed to save user behavior history:', error);
    }
  }

  /**
   * Public API
   */
  getMetrics(): CacheWarmupMetrics {
    return { ...this.metrics };
  }

  addStrategy(strategy: CacheWarmupStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  removeStrategy(name: string): void {
    this.strategies.delete(name);
  }

  enableStrategy(name: string): void {
    const strategy = this.strategies.get(name);
    if (strategy) {
      strategy.enabled = true;
    }
  }

  disableStrategy(name: string): void {
    const strategy = this.strategies.get(name);
    if (strategy) {
      strategy.enabled = false;
    }
  }

  async forceWarmup(keys: string[]): Promise<void> {
    await this.warmKeysImmediate(keys);
  }

  getPredictions(): PredictionResult[] {
    return Array.from(this.predictions.values());
  }
}

// Export singleton instance
export const advancedCacheWarmer = new AdvancedCacheWarmer();

// Export React hook for easy integration
export function useAdvancedCacheWarmer() {
  const { warmupCache } = useCacheManager();

  return {
    warmupCache: warmupCache,
    trackBehavior: (behavior: Omit<UserBehaviorPattern, 'timestamp'>) => 
      advancedCacheWarmer.trackUserBehavior(behavior),
    getMetrics: () => advancedCacheWarmer.getMetrics(),
    forceWarmup: (keys: string[]) => advancedCacheWarmer.forceWarmup(keys),
    getPredictions: () => advancedCacheWarmer.getPredictions()
  };
}