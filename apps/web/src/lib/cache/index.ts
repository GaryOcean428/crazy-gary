/**
 * Comprehensive Caching System for Crazy Gary App
 * 
 * Features:
 * - Multi-backend caching (Memory, localStorage, sessionStorage, IndexedDB)
 * - API response caching with Redis-style patterns
 * - Service Worker for offline support
 * - Advanced cache invalidation and patterns
 * - Browser caching for static assets
 * - Performance monitoring and analytics
 * - Cache warming strategies with predictive loading
 * - Function-level caching decorators
 * - Advanced error handling and fallbacks
 * - Progressive Web App support
 * - ML-based cache optimization
 */

// Core cache infrastructure
export * from './cache-config';
export * from './cache-manager';
export * from './memory-cache';
export * from './local-storage-cache';
export * from './session-storage-cache';
export * from './indexeddb-cache';
export * from './api-cache';

// Cache hooks and utilities
export * from './cache-hooks';
export * from './cache-invalidation';
export * from './cache-monitoring';

// Service Worker integration
export * from './service-worker-cache';
export * from './service-worker-hooks';
export * from './browser-cache';

// Advanced caching features
export * from './cache-decorators';
export * from './cache-error-handler';
export * from './advanced-cache-warmer';
export * from './cache-performance-monitor';

// Types and examples
export * from './cache-types';
export * from './cache-examples';

// Main cache instance for easy access
export { cacheManager, cache } from './cache-manager';

// Enhanced utility functions with advanced features
export const cacheUtils = {
  // Quick cache operations
  get: <T = any>(key: string, defaultValue?: T) => cache.get<T>(key).then(v => v ?? defaultValue),
  set: <T = any>(key: string, value: T, options?: any) => cache.set<T>(key, value, options),
  delete: (key: string) => cache.delete(key),
  clear: () => cache.clear(),
  has: (key: string) => cache.has(key),
  
  // Advanced operations
  getOrSet: <T = any>(key: string, factory: () => Promise<T> | T, options?: any) => 
    cache.getOrSet(key, factory, options),
  
  invalidatePattern: (pattern: string) => cache.invalidatePattern(pattern),
  invalidateByTag: (tag: string) => cache.invalidateByTag(tag),
  
  // Utility for API calls
  api: {
    get: <T = any>(url: string, options?: any) => cache.getOrSet(url, () => 
      fetch(url).then(r => r.json()), options),
    invalidate: (url: string) => cache.delete(url)
  }
};

// Advanced caching utilities
export const advancedCacheUtils = {
  // Decorator utilities
  decorators: {
    cached: (options?: any) => require('./cache-decorators').cached(options),
    cacheWithInvalidation: (options: any) => require('./cache-decorators').cacheWithInvalidation(options),
    cacheApi: (options: any) => require('./cache-decorators').cacheApi(options),
    invalidateCacheOn: (options: any) => require('./cache-decorators').invalidateCacheOn(options),
    rateLimitedCache: (options: any) => require('./cache-decorators').rateLimitedCache(options),
    cacheWithFallback: (options: any) => require('./cache-decorators').cacheWithFallback(options),
    cacheWithStats: (options: any) => require('./cache-decorators').cacheWithStats(options)
  },
  
  // Error handling utilities
  errorHandler: {
    wrap: (cacheName: string, operation: () => Promise<any>, fallback?: () => Promise<any>) =>
      require('./cache-error-handler').cacheErrorUtils.wrap(cacheName, operation, fallback),
    isHealthy: (cacheName: string) =>
      require('./cache-error-handler').cacheErrorUtils.isHealthy(cacheName),
    getStats: () => require('./cache-error-handler').cacheErrorUtils.getStats(),
    addStrategy: (strategy: any) => 
      require('./cache-error-handler').cacheErrorUtils.addStrategy(strategy),
    resetCircuitBreaker: (cacheName: string) =>
      require('./cache-error-handler').cacheErrorUtils.resetCircuitBreaker(cacheName)
  },
  
  // IndexedDB utilities
  indexedDB: {
    utils: () => require('./indexeddb-cache').indexedDBCacheUtils,
    create: (options: any) => require('./indexeddb-cache').indexedDBCacheUtils.create(options),
    isSupported: () => require('./indexeddb-cache').indexedDBCacheUtils.isSupported(),
    getStorageQuota: () => require('./indexeddb-cache').indexedDBCacheUtils.getStorageQuota(),
    clearAllDatabases: () => require('./indexeddb-cache').indexedDBCacheUtils.clearAllDatabases()
  },
  
  // Performance monitoring utilities
  performance: {
    monitor: () => require('./cache-performance-monitor').useCachePerformanceMonitoring(),
    recordOperation: (operation: string, cacheType: string, success: boolean, latency: number) =>
      require('./cache-performance-monitor').cachePerformanceMonitor.recordOperation(
        operation, cacheType, success, latency
      ),
    generateReport: () => require('./cache-performance-monitor').cachePerformanceMonitor.generateReport(),
    getAlerts: () => require('./cache-performance-monitor').cachePerformanceMonitor.getAlerts()
  },
  
  // Advanced warming utilities
  warming: {
    warmer: () => require('./advanced-cache-warmer').useAdvancedCacheWarmer(),
    trackBehavior: (behavior: any) => 
      require('./advanced-cache-warmer').advancedCacheWarmer.trackUserBehavior(behavior),
    getMetrics: () => require('./advanced-cache-warmer').advancedCacheWarmer.getMetrics(),
    forceWarmup: (keys: string[]) => 
      require('./advanced-cache-warmer').advancedCacheWarmer.forceWarmup(keys),
    getPredictions: () => require('./advanced-cache-warmer').advancedCacheWarmer.getPredictions()
  }
};

// Initialize all caching systems
export const initializeCaching = async () => {
  try {
    // Initialize advanced components
    await require('./advanced-cache-warmer').advancedCacheWarmer.initialize();
    require('./cache-performance-monitor').cachePerformanceMonitor.startMonitoring();
    
    console.log('Advanced caching system initialized successfully');
  } catch (error) {
    console.warn('Some caching components failed to initialize:', error);
  }
};

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  // Delay initialization to allow for other modules to load
  setTimeout(initializeCaching, 100);
}