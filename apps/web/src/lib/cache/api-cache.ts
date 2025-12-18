/**
 * API response caching with Redis-style patterns
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { CacheOptions, CacheStrategy, CacheStrategyConfig } from './cache-types';
import { cacheManager } from './cache-manager';
import { getCacheConfig, CACHE_KEYS } from './cache-config';

interface ApiCacheEntry<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: number;
  url: string;
  method: string;
  requestConfig: AxiosRequestConfig;
  etag?: string;
  lastModified?: string;
}

interface CacheableRequest {
  url: string;
  method: string;
  config: AxiosRequestConfig;
  response: Promise<AxiosResponse>;
}

interface CacheStrategyRegistry {
  [pattern: string]: CacheStrategyConfig;
}

export class ApiCache {
  private strategyRegistry: CacheStrategyRegistry = {};
  private defaultStrategy: CacheStrategyConfig = {
    strategy: 'network-first',
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000
  };

  constructor() {
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies(): void {
    // Static assets - cache first
    this.registerStrategy('/static/**', {
      strategy: 'cache-first',
      timeout: 10000
    });

    // API endpoints - network first
    this.registerStrategy('/api/**', {
      strategy: 'network-first',
      timeout: 8000,
      retryAttempts: 2
    });

    // User data - stale while revalidate
    this.registerStrategy('/api/user/**', {
      strategy: 'stale-while-revalidate',
      timeout: 5000
    });

    // Dashboard data - cache first with shorter timeout
    this.registerStrategy('/api/dashboard/**', {
      strategy: 'cache-first',
      timeout: 3000
    });

    // Analytics - cache with longer TTL
    this.registerStrategy('/api/analytics/**', {
      strategy: 'cache-first',
      timeout: 15000
    });
  }

  registerStrategy(pattern: string, config: CacheStrategyConfig): void {
    this.strategyRegistry[pattern] = config;
  }

  private getStrategyForUrl(url: string): CacheStrategyConfig {
    for (const [pattern, config] of Object.entries(this.strategyRegistry)) {
      const regex = new RegExp(pattern.replace('**', '.*').replace('*', '.*'));
      if (regex.test(url)) {
        return config;
      }
    }
    return this.defaultStrategy;
  }

  private getCacheKey(request: AxiosRequestConfig): string {
    const url = request.url || '';
    const method = (request.method || 'GET').toUpperCase();
    const params = request.params ? JSON.stringify(request.params) : '';
    const data = request.data ? JSON.stringify(request.data) : '';
    
    const key = `${method}:${url}:${params}:${data}`;
    return CACHE_KEYS.generate('api', key);
  }

  private isCacheableRequest(config: AxiosRequestConfig): boolean {
    const method = (config.method || 'GET').toUpperCase();
    
    // Only cache GET requests
    if (method !== 'GET') {
      return false;
    }

    // Don't cache if explicitly disabled
    if (config.cache === false) {
      return false;
    }

    // Don't cache if there's no cache option or it's explicitly enabled
    if (config.cache === undefined || config.cache === true) {
      return true;
    }

    return false;
  }

  private async getCachedResponse<T = any>(key: string): Promise<ApiCacheEntry<T> | null> {
    try {
      const cached = await cacheManager.get<ApiCacheEntry<T>>(key, 'memory');
      if (cached) {
        // Check if cached entry is still valid
        const age = Date.now() - cached.timestamp;
        const maxAge = this.getMaxAgeForUrl(cached.url);
        
        if (age < maxAge) {
          return cached;
        } else {
          // Entry is stale but not expired, mark for background refresh
          this.scheduleBackgroundRefresh(cached);
        }
      }
    } catch (error) {
      console.warn('Cache retrieval error:', error);
    }
    
    return null;
  }

  private async setCachedResponse<T = any>(key: string, response: AxiosResponse<T>): Promise<void> {
    try {
      const cacheEntry: ApiCacheEntry<T> = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractCacheableHeaders(response.headers),
        timestamp: Date.now(),
        url: response.config.url || '',
        method: (response.config.method || 'GET').toUpperCase(),
        requestConfig: response.config,
        etag: response.headers.etag,
        lastModified: response.headers['last-modified']
      };

      const ttl = this.getTtlForUrl(cacheEntry.url);
      await cacheManager.set(key, cacheEntry, { ttl, backend: 'memory' });
    } catch (error) {
      console.warn('Cache storage error:', error);
    }
  }

  private extractCacheableHeaders(headers: any): Record<string, string> {
    const cacheableHeaders: string[] = [
      'content-type',
      'content-length',
      'etag',
      'last-modified',
      'cache-control',
      'expires'
    ];

    const extracted: Record<string, string> = {};
    for (const header of cacheableHeaders) {
      if (headers[header]) {
        extracted[header] = headers[header];
      }
    }

    return extracted;
  }

  private getMaxAgeForUrl(url: string): number {
    const strategy = this.getStrategyForUrl(url);
    const baseTtl = this.getTtlForUrl(url);
    
    // Allow 10% buffer for stale-while-revalidate
    return strategy.strategy === 'stale-while-revalidate' ? baseTtl * 1.1 : baseTtl;
  }

  private getTtlForUrl(url: string): number {
    const strategy = this.getStrategyForUrl(url);
    
    // Base TTL from configuration
    const config = getCacheConfig();
    let ttl = config.api.ttl;
    
    // Adjust based on URL pattern
    if (url.includes('/static/')) {
      ttl = config.staticAssets.ttl;
    } else if (url.includes('/user/')) {
      ttl = config.userData.ttl;
    } else if (url.includes('/analytics/')) {
      ttl = config.api.ttl * 4; // Longer cache for analytics
    } else if (url.includes('/dashboard/')) {
      ttl = config.api.ttl * 0.5; // Shorter cache for dashboard
    }
    
    return ttl;
  }

  private scheduleBackgroundRefresh<T = any>(cachedEntry: ApiCacheEntry<T>): void {
    // Implement background refresh for stale entries
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Use background sync if available
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register(`refresh-${cachedEntry.url}`);
      });
    } else {
      // Fallback to regular timeout
      setTimeout(() => {
        this.refreshCacheEntry(cachedEntry);
      }, this.getStrategyForUrl(cachedEntry.url).timeout || 5000);
    }
  }

  private async refreshCacheEntry<T = any>(cachedEntry: ApiCacheEntry<T>): Promise<void> {
    try {
      const response = await axios({
        url: cachedEntry.url,
        method: cachedEntry.method as any,
        headers: {
          'If-None-Match': cachedEntry.etag || '',
          'If-Modified-Since': cachedEntry.lastModified || ''
        }
      });

      // If we get a 304, the cached entry is still valid
      if (response.status === 304) {
        const key = this.getCacheKey(cachedEntry.requestConfig);
        await cacheManager.set(key, cachedEntry, { ttl: this.getTtlForUrl(cachedEntry.url) });
        return;
      }

      // Update cache with new response
      const key = this.getCacheKey(cachedEntry.requestConfig);
      await this.setCachedResponse(key, response);
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }

  async execute<T = any>(requestConfig: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if (!this.isCacheableRequest(requestConfig)) {
      // Not cacheable, execute normally
      return axios(requestConfig);
    }

    const strategy = this.getStrategyForUrl(requestConfig.url || '');
    const cacheKey = this.getCacheKey(requestConfig);

    switch (strategy.strategy) {
      case 'cache-first':
        return this.cacheFirstStrategy<T>(cacheKey, requestConfig, strategy);
      
      case 'network-first':
        return this.networkFirstStrategy<T>(cacheKey, requestConfig, strategy);
      
      case 'stale-while-revalidate':
        return this.staleWhileRevalidateStrategy<T>(cacheKey, requestConfig, strategy);
      
      case 'cache-only':
        return this.cacheOnlyStrategy<T>(cacheKey, requestConfig, strategy);
      
      case 'network-only':
        return axios(requestConfig);
      
      case 'custom':
        return this.customStrategy<T>(cacheKey, requestConfig, strategy);
      
      default:
        return this.networkFirstStrategy<T>(cacheKey, requestConfig, this.defaultStrategy);
    }
  }

  private async cacheFirstStrategy<T = any>(
    cacheKey: string, 
    requestConfig: AxiosRequestConfig, 
    strategy: CacheStrategyConfig
  ): Promise<AxiosResponse<T>> {
    const cached = await this.getCachedResponse<T>(cacheKey);
    
    if (cached) {
      return {
        data: cached.data,
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
        config: requestConfig
      } as AxiosResponse<T>;
    }

    // Cache miss, fetch from network
    const response = await axios(requestConfig);
    await this.setCachedResponse(cacheKey, response);
    return response;
  }

  private async networkFirstStrategy<T = any>(
    cacheKey: string, 
    requestConfig: AxiosRequestConfig, 
    strategy: CacheStrategyConfig
  ): Promise<AxiosResponse<T>> {
    try {
      // Try network first with timeout
      const response = await this.fetchWithTimeout(requestConfig, strategy.timeout || 5000);
      await this.setCachedResponse(cacheKey, response);
      return response;
    } catch (error) {
      // Network failed, try cache
      const cached = await this.getCachedResponse<T>(cacheKey);
      if (cached) {
        return {
          data: cached.data,
          status: cached.status,
          statusText: cached.statusText,
          headers: cached.headers,
          config: requestConfig
        } as AxiosResponse<T>;
      }
      
      // No cache available, rethrow error
      throw error;
    }
  }

  private async staleWhileRevalidateStrategy<T = any>(
    cacheKey: string, 
    requestConfig: AxiosRequestConfig, 
    strategy: CacheStrategyConfig
  ): Promise<AxiosResponse<T>> {
    const cached = await this.getCachedResponse<T>(cacheKey);
    
    if (cached) {
      // Return cached data immediately
      const response = {
        data: cached.data,
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
        config: requestConfig
      } as AxiosResponse<T>;

      // Update cache in background
      this.updateCacheInBackground(cacheKey, requestConfig);
      
      return response;
    }

    // No cache, fetch from network
    const response = await axios(requestConfig);
    await this.setCachedResponse(cacheKey, response);
    return response;
  }

  private async cacheOnlyStrategy<T = any>(
    cacheKey: string, 
    requestConfig: AxiosRequestConfig, 
    strategy: CacheStrategyConfig
  ): Promise<AxiosResponse<T>> {
    const cached = await this.getCachedResponse<T>(cacheKey);
    
    if (cached) {
      return {
        data: cached.data,
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
        config: requestConfig
      } as AxiosResponse<T>;
    }

    // Cache miss, return error
    throw new Error(`Cache miss for ${requestConfig.url}`);
  }

  private async customStrategy<T = any>(
    cacheKey: string, 
    requestConfig: AxiosRequestConfig, 
    strategy: CacheStrategyConfig
  ): Promise<AxiosResponse<T>> {
    if (strategy.errorHandler) {
      try {
        return await axios(requestConfig);
      } catch (error) {
        return await strategy.errorHandler(error as Error);
      }
    }
    
    return axios(requestConfig);
  }

  private async fetchWithTimeout<T = any>(config: AxiosRequestConfig, timeout: number): Promise<AxiosResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await axios({
        ...config,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async updateCacheInBackground(cacheKey: string, requestConfig: AxiosRequestConfig): Promise<void> {
    try {
      const response = await axios(requestConfig);
      await this.setCachedResponse(cacheKey, response);
    } catch (error) {
      console.warn('Background cache update failed:', error);
    }
  }

  // Cache management methods
  async invalidateUrlPattern(pattern: string): Promise<number> {
    const keys = await cacheManager.keys('memory');
    const regex = new RegExp(pattern.replace('**', '.*').replace('*', '.*'));
    let invalidated = 0;
    
    for (const key of keys) {
      if (key.includes('api:') && regex.test(key)) {
        await cacheManager.delete(key, 'memory');
        invalidated++;
      }
    }
    
    return invalidated;
  }

  async getCacheStats(): Promise<{
    totalEntries: number;
    memoryUsage: number;
    hitRate: number;
    topUrls: Array<{ url: string; hits: number }>;
  }> {
    const stats = await cacheManager.stats('memory');
    const keys = await cacheManager.keys('memory');
    const urlStats = new Map<string, number>();
    
    // Analyze cache entries
    for (const key of keys) {
      if (key.includes('api:')) {
        try {
          const entry = await cacheManager.get<ApiCacheEntry>(key, 'memory');
          if (entry) {
            const url = entry.url;
            const currentHits = urlStats.get(url) || 0;
            urlStats.set(url, currentHits + (entry as any).hits || 1);
          }
        } catch {
          // Skip invalid entries
        }
      }
    }
    
    const topUrls = Array.from(urlStats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, hits]) => ({ url, hits }));
    
    return {
      totalEntries: stats.entryCount,
      memoryUsage: stats.totalSize,
      hitRate: stats.hitRate,
      topUrls
    };
  }

  async clearCache(): Promise<void> {
    await cacheManager.clear('memory');
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Axios interceptor for automatic caching
export const setupApiCacheInterceptor = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Mark request for caching
      if (apiCache.isCacheableRequest(config)) {
        (config as any).__cacheEnabled = true;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    async (response) => {
      const config = response.config as AxiosRequestConfig & { __cacheEnabled?: boolean };
      
      if (config.__cacheEnabled) {
        const cacheKey = apiCache['getCacheKey'](config);
        await apiCache['setCachedResponse'](cacheKey, response);
      }
      
      return response;
    },
    async (error) => {
      // Handle cache fallbacks on network errors
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
        const config = error.config as AxiosRequestConfig & { __cacheEnabled?: boolean };
        
        if (config?.__cacheEnabled) {
          const cacheKey = apiCache['getCacheKey'](config);
          const cached = await apiCache['getCachedResponse'](cacheKey);
          
          if (cached) {
            return Promise.resolve({
              data: cached.data,
              status: cached.status,
              statusText: cached.statusText,
              headers: cached.headers,
              config: config
            } as AxiosResponse);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
};