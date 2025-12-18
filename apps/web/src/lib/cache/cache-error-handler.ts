/**
 * Advanced Cache Error Handling and Fallback System
 * Provides robust error handling with intelligent fallbacks and recovery mechanisms
 */

import { CacheBackend } from './cache-types';
import { MemoryCache } from './memory-cache';
import { LocalStorageCache } from './local-storage-cache';
import { SessionStorageCache } from './session-storage-cache';
import { indexedDBCache } from './indexeddb-cache';

export interface CacheErrorHandlerConfig {
  enableFallback: boolean;
  fallbackOrder: string[];
  maxRetries: number;
  retryDelay: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  enableOfflineFallback: boolean;
  offlineDataSource?: () => Promise<any>;
  errorLogging: boolean;
  performanceThreshold: number; // ms
}

export interface CacheFallbackStrategy {
  name: string;
  condition: (error: Error) => boolean;
  action: () => Promise<any>;
  priority: number;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextRetryTime: number;
}

export class CacheErrorHandler {
  private config: CacheErrorHandlerConfig;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private fallbackStrategies: CacheFallbackStrategy[] = [];
  private errorLog: Array<{
    timestamp: number;
    cache: string;
    operation: string;
    error: string;
    context?: any;
  }> = [];

  constructor(config: Partial<CacheErrorHandlerConfig> = {}) {
    this.config = {
      enableFallback: true,
      fallbackOrder: ['memory', 'localStorage', 'sessionStorage'],
      maxRetries: 3,
      retryDelay: 100,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000, // 1 minute
      enableOfflineFallback: true,
      errorLogging: true,
      performanceThreshold: 1000,
      ...config
    };

    this.initializeDefaultFallbacks();
  }

  /**
   * Wrap cache operations with error handling and fallbacks
   */
  async executeWithFallback<T>(
    cacheName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Check circuit breaker
      if (this.config.enableCircuitBreaker && this.isCircuitBreakerOpen(cacheName)) {
        throw new Error(`Circuit breaker is open for ${cacheName}`);
      }

      const result = await this.executeWithRetry(cacheName, operation);
      const duration = Date.now() - startTime;

      // Log performance issues
      if (duration > this.config.performanceThreshold) {
        this.logError('performance', cacheName, 'slow_operation', {
          duration,
          threshold: this.config.performanceThreshold
        });
      }

      // Reset circuit breaker on success
      this.resetCircuitBreaker(cacheName);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failure for circuit breaker
      this.recordFailure(cacheName, error as Error);

      // Log error
      if (this.config.errorLogging) {
        this.logError('cache', cacheName, 'operation_failed', {
          error: (error as Error).message,
          duration,
          stack: (error as Error).stack
        });
      }

      // Try fallbacks
      if (this.config.enableFallback) {
        const fallbackResult = await this.tryFallbacks(cacheName, error as Error, fallback);
        if (fallbackResult !== undefined) {
          return fallbackResult;
        }
      }

      throw error;
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(cacheName: string, operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry certain types of errors
        if (!this.shouldRetry(error as Error)) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Try fallback strategies
   */
  private async tryFallbacks<T>(
    cacheName: string, 
    error: Error, 
    customFallback?: () => Promise<T>
  ): Promise<T | undefined> {
    
    // Try custom fallback first
    if (customFallback) {
      try {
        return await customFallback();
      } catch (fallbackError) {
        this.logError('fallback', cacheName, 'custom_fallback_failed', {
          originalError: error.message,
          fallbackError: (fallbackError as Error).message
        });
      }
    }

    // Try predefined fallback strategies
    for (const strategy of this.fallbackStrategies
      .filter(s => s.condition(error))
      .sort((a, b) => b.priority - a.priority)) {
      
      try {
        return await strategy.action();
      } catch (strategyError) {
        this.logError('fallback', cacheName, 'strategy_failed', {
          strategy: strategy.name,
          error: (strategyError as Error).message
        });
      }
    }

    // Try alternative cache backends
    const availableBackends = this.getAvailableCacheBackends(cacheName);
    
    for (const backendName of availableBackends) {
      if (backendName !== cacheName) {
        try {
          const backend = this.getCacheBackend(backendName);
          if (backend) {
            return await backend.get<T>(`fallback:${cacheName}`) || 
                   await this.createFallbackData(cacheName, error);
          }
        } catch (backendError) {
          this.logError('fallback', cacheName, 'backend_fallback_failed', {
            backend: backendName,
            error: (backendError as Error).message
          });
        }
      }
    }

    return undefined;
  }

  /**
   * Create fallback data when all caches fail
   */
  private async createFallbackData(cacheName: string, error: Error): Promise<any> {
    // Return appropriate default data based on cache type
    if (cacheName.includes('api')) {
      return { error: true, message: 'Data unavailable', fallback: true };
    }
    
    if (cacheName.includes('user')) {
      return { id: 'unknown', name: 'Guest User', fallback: true };
    }

    return { fallback: true, error: error.message };
  }

  /**
   * Check if error should trigger retry
   */
  private shouldRetry(error: Error): boolean {
    const retryableErrors = [
      'NetworkError',
      'AbortError', 
      'TimeoutError',
      'QuotaExceededError',
      'NS_ERROR_NET_RESET'
    ];

    return retryableErrors.some(type => 
      error.name === type || 
      error.message.includes(type) ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  }

  /**
   * Circuit breaker methods
   */
  private isCircuitBreakerOpen(cacheName: string): boolean {
    if (!this.config.enableCircuitBreaker) return false;

    const breaker = this.circuitBreakers.get(cacheName);
    if (!breaker) return false;

    const now = Date.now();
    
    if (breaker.isOpen && now < breaker.nextRetryTime) {
      return true;
    }

    if (breaker.isOpen && now >= breaker.nextRetryTime) {
      // Try half-open state
      breaker.isOpen = false;
      breaker.failureCount = 0;
    }

    return false;
  }

  private recordFailure(cacheName: string, error: Error): void {
    if (!this.config.enableCircuitBreaker) return;

    const breaker = this.circuitBreakers.get(cacheName) || {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextRetryTime: 0
    };

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
      breaker.isOpen = true;
      breaker.nextRetryTime = Date.now() + this.config.circuitBreakerTimeout;
    }

    this.circuitBreakers.set(cacheName, breaker);
  }

  private resetCircuitBreaker(cacheName: string): void {
    const breaker = this.circuitBreakers.get(cacheName);
    if (breaker) {
      breaker.failureCount = 0;
      breaker.isOpen = false;
      breaker.nextRetryTime = 0;
    }
  }

  /**
   * Initialize default fallback strategies
   */
  private initializeDefaultFallbacks(): void {
    this.fallbackStrategies = [
      {
        name: 'quota_exceeded',
        condition: (error) => error.name === 'QuotaExceededError',
        priority: 10,
        action: async () => {
          // Clear some space and retry
          await this.clearOldEntries();
          return null; // Will trigger retry of original operation
        }
      },
      {
        name: 'network_error',
        condition: (error) => error.message.includes('network') || error.name === 'NetworkError',
        priority: 8,
        action: async () => {
          // Use offline data if available
          if (this.config.enableOfflineFallback && this.config.offlineDataSource) {
            return await this.config.offlineDataSource();
          }
          return null;
        }
      },
      {
        name: 'timeout_error',
        condition: (error) => error.message.includes('timeout') || error.name === 'TimeoutError',
        priority: 6,
        action: async () => {
          // Return stale data if available
          return await this.getStaleData();
        }
      }
    ];
  }

  /**
   * Get available cache backends
   */
  private getAvailableCacheBackends(excludeName?: string): string[] {
    const backends = ['memory', 'localStorage', 'sessionStorage', 'indexedDB'];
    
    // Test which backends are actually working
    const available: string[] = [];
    
    for (const backendName of backends) {
      if (backendName === excludeName) continue;
      
      try {
        const backend = this.getCacheBackend(backendName);
        if (backend) {
          available.push(backendName);
        }
      } catch {
        // Backend not available
      }
    }
    
    return available;
  }

  /**
   * Get cache backend instance
   */
  private getCacheBackend(name: string): CacheBackend | null {
    switch (name) {
      case 'memory':
        return new MemoryCache();
      case 'localStorage':
        return new LocalStorageCache();
      case 'sessionStorage':
        return new SessionStorageCache();
      case 'indexedDB':
        return indexedDBCache;
      default:
        return null;
    }
  }

  /**
   * Clear old entries to free space
   */
  private async clearOldEntries(): Promise<void> {
    try {
      // Clear memory cache first
      const memoryCache = new MemoryCache();
      await memoryCache.clear();

      // Clear old entries from localStorage
      const localStorageCache = new LocalStorageCache();
      const keys = await localStorageCache.keys();
      const oldKeys = keys.slice(0, Math.floor(keys.length / 2)); // Clear half
      await Promise.all(oldKeys.map(key => localStorageCache.delete(key)));

    } catch (error) {
      console.warn('Failed to clear old entries:', error);
    }
  }

  /**
   * Get stale data from cache
   */
  private async getStaleData(): Promise<any> {
    // This would need to be implemented to return expired but cached data
    return { stale: true, message: 'Using cached stale data' };
  }

  /**
   * Utility methods
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logError(category: string, cache: string, operation: string, context?: any): void {
    const entry = {
      timestamp: Date.now(),
      cache,
      operation,
      error: category,
      context
    };
    
    this.errorLog.push(entry);
    
    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000);
    }

    // In production, you might want to send these to a logging service
    if (this.config.errorLogging) {
      console.warn('Cache Error:', entry);
    }
  }

  /**
   * Public methods for managing the error handler
   */
  
  /**
   * Add custom fallback strategy
   */
  addFallbackStrategy(strategy: CacheFallbackStrategy): void {
    this.fallbackStrategies.push(strategy);
    this.fallbackStrategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorByCache: Record<string, number>;
    errorByType: Record<string, number>;
    recentErrors: number;
    circuitBreakers: Record<string, CircuitBreakerState>;
  } {
    const errorByCache: Record<string, number> = {};
    const errorByType: Record<string, number> = {};
    
    for (const entry of this.errorLog) {
      errorByCache[entry.cache] = (errorByCache[entry.cache] || 0) + 1;
      errorByType[entry.error] = (errorByType[entry.error] || 0) + 1;
    }

    const recentErrors = this.errorLog.filter(
      entry => Date.now() - entry.timestamp < 5 * 60 * 1000 // Last 5 minutes
    ).length;

    return {
      totalErrors: this.errorLog.length,
      errorByCache,
      errorByType,
      recentErrors,
      circuitBreakers: Object.fromEntries(this.circuitBreakers)
    };
  }

  /**
   * Reset circuit breaker for a specific cache
   */
  resetCircuitBreakerFor(cacheName: string): void {
    this.circuitBreakers.delete(cacheName);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CacheErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Health check for cache backends
   */
  async healthCheck(): Promise<{
    backends: Record<string, { healthy: boolean; error?: string; responseTime?: number }>;
    overall: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    const backends = ['memory', 'localStorage', 'sessionStorage', 'indexedDB'];
    const results: Record<string, { healthy: boolean; error?: string; responseTime?: number }> = {};
    let healthyCount = 0;

    for (const backendName of backends) {
      try {
        const start = Date.now();
        const backend = this.getCacheBackend(backendName);
        
        if (backend) {
          // Simple test operation
          await backend.set('health-check', { test: true }, { ttl: 1000 });
          await backend.delete('health-check');
          
          const responseTime = Date.now() - start;
          results[backendName] = { healthy: true, responseTime };
          healthyCount++;
        } else {
          results[backendName] = { healthy: false, error: 'Backend not available' };
        }
      } catch (error) {
        results[backendName] = { 
          healthy: false, 
          error: (error as Error).message 
        };
      }
    }

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount === 0) {
      overall = 'unhealthy';
    } else if (healthyCount === backends.length) {
      overall = 'healthy';
    } else {
      overall = 'degraded';
    }

    return { backends: results, overall };
  }
}

// Export singleton instance
export const cacheErrorHandler = new CacheErrorHandler();

// Export utility functions
export const cacheErrorUtils = {
  /**
   * Create a wrapped cache operation with error handling
   */
  wrap: <T>(
    cacheName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ) => cacheErrorHandler.executeWithFallback(cacheName, operation, fallback),

  /**
   * Check if cache backend is healthy
   */
  async isHealthy(cacheName: string): Promise<boolean> {
    const health = await cacheErrorHandler.healthCheck();
    return health.backends[cacheName]?.healthy || false;
  },

  /**
   * Get error statistics
   */
  getStats: () => cacheErrorHandler.getErrorStats(),

  /**
   * Add custom fallback strategy
   */
  addStrategy: (strategy: CacheFallbackStrategy) => 
    cacheErrorHandler.addFallbackStrategy(strategy),

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker: (cacheName: string) => 
    cacheErrorHandler.resetCircuitBreakerFor(cacheName)
};