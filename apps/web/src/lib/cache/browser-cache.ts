/**
 * Browser caching utilities for static assets and configuration
 */

import { useState, useEffect, useCallback } from 'react';
import { getCacheConfig } from './cache-config';

interface CacheControlOptions {
  maxAge?: number;
  maxStale?: number;
  minFresh?: number;
  noCache?: boolean;
  noStore?: boolean;
  noTransform?: boolean;
  onlyIfCached?: boolean;
  immutable?: boolean;
}

interface AssetCacheConfig {
  pattern: RegExp;
  cacheControl: CacheControlOptions;
  storage: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  compression?: boolean;
  encryption?: boolean;
  priority: 'low' | 'normal' | 'high';
}

export class BrowserCacheManager {
  private static instance: BrowserCacheManager;
  private config: ReturnType<typeof getCacheConfig>;
  private assetConfigs: AssetCacheConfig[] = [];
  private compressionEnabled: boolean = true;
  private encryptionEnabled: boolean = false;

  constructor() {
    this.config = getCacheConfig();
    this.initializeAssetConfigs();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): BrowserCacheManager {
    if (!BrowserCacheManager.instance) {
      BrowserCacheManager.instance = new BrowserCacheManager();
    }
    return BrowserCacheManager.instance;
  }

  private initializeAssetConfigs(): void {
    this.assetConfigs = [
      // JavaScript and CSS files
      {
        pattern: /\.(js|css)$/,
        cacheControl: {
          maxAge: 31536000, // 1 year
          immutable: true
        },
        storage: 'localStorage',
        compression: true,
        priority: 'high'
      },
      
      // Images
      {
        pattern: /\.(png|jpg|jpeg|gif|svg|webp|avif)$/,
        cacheControl: {
          maxAge: 2592000, // 30 days
          immutable: true
        },
        storage: 'localStorage',
        compression: true,
        priority: 'normal'
      },
      
      // Fonts
      {
        pattern: /\.(woff|woff2|ttf|eot|otf)$/,
        cacheControl: {
          maxAge: 31536000, // 1 year
          immutable: true
        },
        storage: 'localStorage',
        compression: false,
        priority: 'high'
      },
      
      // Videos
      {
        pattern: /\.(mp4|webm|ogg|avi|mov)$/,
        cacheControl: {
          maxAge: 604800, // 1 week
          maxStale: 86400 // 1 day stale
        },
        storage: 'indexedDB',
        compression: false,
        priority: 'low'
      },
      
      // Documents
      {
        pattern: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/,
        cacheControl: {
          maxAge: 86400, // 1 day
          noTransform: true
        },
        storage: 'indexedDB',
        compression: true,
        priority: 'normal'
      },
      
      // API responses
      {
        pattern: /\/api\/.*/,
        cacheControl: {
          maxAge: 300, // 5 minutes
          minFresh: 60, // 1 minute fresh
          noTransform: true
        },
        storage: 'sessionStorage',
        compression: true,
        priority: 'normal'
      },
      
      // JSON data
      {
        pattern: /\.json$/,
        cacheControl: {
          maxAge: 3600, // 1 hour
          minFresh: 300 // 5 minutes fresh
        },
        storage: 'localStorage',
        compression: true,
        priority: 'normal'
      }
    ];
  }

  // Asset caching methods
  async cacheAsset(url: string, data: any, options?: Partial<AssetCacheConfig>): Promise<boolean> {
    try {
      const config = this.getAssetConfig(url, options);
      if (!config) return false;

      // Compress data if enabled
      let processedData = data;
      if (config.compression && this.compressionEnabled) {
        processedData = await this.compressData(data);
      }

      // Encrypt data if enabled
      if (config.encryption && this.encryptionEnabled) {
        processedData = await this.encryptData(processedData);
      }

      // Store based on storage type
      const success = await this.storeAsset(url, processedData, config);
      
      if (success) {
        this.setCacheHeaders(url, config.cacheControl);
        this.monitorCacheSize();
      }

      return success;
    } catch (error) {
      console.error('Asset caching failed:', error);
      return false;
    }
  }

  async getCachedAsset(url: string): Promise<any> {
    try {
      const config = this.getAssetConfig(url);
      if (!config) return null;

      const data = await this.retrieveAsset(url, config);
      if (!data) return null;

      // Decrypt if encrypted
      if (config.encryption && this.encryptionEnabled) {
        const decrypted = await this.decryptData(data);
        return decrypted;
      }

      // Decompress if compressed
      if (config.compression && this.compressionEnabled) {
        return await this.decompressData(data);
      }

      return data;
    } catch (error) {
      console.error('Asset retrieval failed:', error);
      return null;
    }
  }

  async invalidateAsset(url: string): Promise<boolean> {
    try {
      const config = this.getAssetConfig(url);
      if (!config) return false;

      const success = await this.removeAsset(url, config);
      
      // Remove cache headers
      this.removeCacheHeaders(url);
      
      return success;
    } catch (error) {
      console.error('Asset invalidation failed:', error);
      return false;
    }
  }

  async clearAssetCache(pattern?: RegExp): Promise<number> {
    let clearedCount = 0;
    
    for (const config of this.assetConfigs) {
      if (!pattern || config.pattern.test(pattern.source)) {
        const keys = await this.getStoredKeys(config.storage);
        for (const key of keys) {
          if (this.isAssetKey(key)) {
            await this.removeStoredAsset(key, config.storage);
            clearedCount++;
          }
        }
      }
    }
    
    return clearedCount;
  }

  // Cache headers management
  private setCacheHeaders(url: string, options: CacheControlOptions): void {
    if (typeof window === 'undefined') return;

    const cacheControl = this.buildCacheControlHeader(options);
    
    // Set in localStorage for management
    try {
      const headers = JSON.parse(localStorage.getItem('cache:headers') || '{}');
      headers[url] = {
        cacheControl,
        timestamp: Date.now(),
        options
      };
      localStorage.setItem('cache:headers', JSON.stringify(headers));
    } catch (error) {
      console.warn('Failed to set cache headers:', error);
    }
  }

  private removeCacheHeaders(url: string): void {
    try {
      const headers = JSON.parse(localStorage.getItem('cache:headers') || '{}');
      delete headers[url];
      localStorage.setItem('cache:headers', JSON.stringify(headers));
    } catch (error) {
      console.warn('Failed to remove cache headers:', error);
    }
  }

  private buildCacheControlHeader(options: CacheControlOptions): string {
    const parts: string[] = [];
    
    if (options.maxAge) parts.push(`max-age=${options.maxAge}`);
    if (options.maxStale) parts.push(`max-stale=${options.maxStale}`);
    if (options.minFresh) parts.push(`min-fresh=${options.minFresh}`);
    if (options.noCache) parts.push('no-cache');
    if (options.noStore) parts.push('no-store');
    if (options.noTransform) parts.push('no-transform');
    if (options.onlyIfCached) parts.push('only-if-cached');
    if (options.immutable) parts.push('immutable');
    
    return parts.join(', ');
  }

  // Storage management
  private async storeAsset(url: string, data: any, config: AssetCacheConfig): Promise<boolean> {
    try {
      const key = this.getStorageKey(url);
      
      switch (config.storage) {
        case 'localStorage':
          return this.storeInLocalStorage(key, data);
        case 'sessionStorage':
          return this.storeInSessionStorage(key, data);
        case 'indexedDB':
          return this.storeInIndexedDB(key, data);
        case 'memory':
          return this.storeInMemory(key, data);
        default:
          return false;
      }
    } catch (error) {
      console.error('Asset storage failed:', error);
      return false;
    }
  }

  private async retrieveAsset(url: string, config: AssetCacheConfig): Promise<any> {
    try {
      const key = this.getStorageKey(url);
      
      switch (config.storage) {
        case 'localStorage':
          return this.getFromLocalStorage(key);
        case 'sessionStorage':
          return this.getFromSessionStorage(key);
        case 'indexedDB':
          return this.getFromIndexedDB(key);
        case 'memory':
          return this.getFromMemory(key);
        default:
          return null;
      }
    } catch (error) {
      console.error('Asset retrieval failed:', error);
      return null;
    }
  }

  private async removeAsset(url: string, config: AssetCacheConfig): Promise<boolean> {
    try {
      const key = this.getStorageKey(url);
      
      switch (config.storage) {
        case 'localStorage':
          return this.removeFromLocalStorage(key);
        case 'sessionStorage':
          return this.removeFromSessionStorage(key);
        case 'indexedDB':
          return this.removeFromIndexedDB(key);
        case 'memory':
          return this.removeFromMemory(key);
        default:
          return false;
      }
    } catch (error) {
      console.error('Asset removal failed:', error);
      return false;
    }
  }

  // Storage implementations
  private storeInLocalStorage(key: string, data: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      }));
      return true;
    } catch (error) {
      // Handle quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupLocalStorage();
        try {
          localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now(),
            version: '1.0.0'
          }));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  private getFromLocalStorage(key: string): any {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      return parsed.data;
    } catch {
      return null;
    }
  }

  private removeFromLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  private storeInSessionStorage(key: string, data: any): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      }));
      return true;
    } catch {
      return false;
    }
  }

  private getFromSessionStorage(key: string): any {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      return parsed.data;
    } catch {
      return null;
    }
  }

  private removeFromSessionStorage(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  // IndexedDB implementation (simplified)
  private async storeInIndexedDB(key: string, data: any): Promise<boolean> {
    try {
      if (!('indexedDB' in window)) return false;
      
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      await store.put({
        key,
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      });
      
      return true;
    } catch (error) {
      console.error('IndexedDB storage failed:', error);
      return false;
    }
  }

  private async getFromIndexedDB(key: string): Promise<any> {
    try {
      if (!('indexedDB' in window)) return null;
      
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      
      const result = await store.get(key);
      return result?.data || null;
    } catch (error) {
      console.error('IndexedDB retrieval failed:', error);
      return null;
    }
  }

  private async removeFromIndexedDB(key: string): Promise<boolean> {
    try {
      if (!('indexedDB' in window)) return false;
      
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      await store.delete(key);
      return true;
    } catch (error) {
      console.error('IndexedDB removal failed:', error);
      return false;
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CacheDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'key' });
        }
      };
    });
  }

  // Memory storage (for high-priority items)
  private memoryCache = new Map<string, any>();

  private storeInMemory(key: string, data: any): boolean {
    try {
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      });
      return true;
    } catch {
      return false;
    }
  }

  private getFromMemory(key: string): any {
    try {
      const item = this.memoryCache.get(key);
      return item?.data || null;
    } catch {
      return null;
    }
  }

  private removeFromMemory(key: string): boolean {
    try {
      this.memoryCache.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  // Helper methods
  private getAssetConfig(url: string, overrideOptions?: Partial<AssetCacheConfig>): AssetCacheConfig | null {
    const config = this.assetConfigs.find(c => c.pattern.test(url));
    if (!config) return null;
    
    return {
      ...config,
      ...overrideOptions
    };
  }

  private getStorageKey(url: string): string {
    const urlObj = new URL(url, window.location.origin);
    return `asset:${urlObj.pathname}${urlObj.search}`;
  }

  private isAssetKey(key: string): boolean {
    return key.startsWith('asset:');
  }

  private async getStoredKeys(storage: AssetCacheConfig['storage']): Promise<string[]> {
    switch (storage) {
      case 'localStorage':
        return Object.keys(localStorage).filter(key => this.isAssetKey(key));
      case 'sessionStorage':
        return Object.keys(sessionStorage).filter(key => this.isAssetKey(key));
      case 'indexedDB':
        // This would require a more complex implementation
        return [];
      case 'memory':
        return Array.from(this.memoryCache.keys());
      default:
        return [];
    }
  }

  private async removeStoredAsset(key: string, storage: AssetCacheConfig['storage']): Promise<boolean> {
    switch (storage) {
      case 'localStorage':
        return this.removeFromLocalStorage(key);
      case 'sessionStorage':
        return this.removeFromSessionStorage(key);
      case 'indexedDB':
        return this.removeFromIndexedDB(key);
      case 'memory':
        return this.removeFromMemory(key);
      default:
        return false;
    }
  }

  private cleanupLocalStorage(): void {
    try {
      const items = Object.keys(localStorage)
        .filter(key => key.startsWith('asset:'))
        .map(key => ({
          key,
          data: JSON.parse(localStorage.getItem(key) || '{}')
        }))
        .sort((a, b) => a.data.timestamp - b.data.timestamp); // Oldest first
      
      // Remove oldest 20% to free space
      const toRemove = Math.ceil(items.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(items[i].key);
      }
    } catch (error) {
      console.warn('LocalStorage cleanup failed:', error);
    }
  }

  // Compression and encryption (simplified implementations)
  private async compressData(data: any): Promise<string> {
    // Simple compression using JSON.stringify and basic encoding
    // In production, use a proper compression library like pako
    const jsonString = JSON.stringify(data);
    return btoa(jsonString); // Base64 encoding as a simple "compression"
  }

  private async decompressData(compressedData: string): Promise<any> {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }

  private async encryptData(data: any): Promise<string> {
    // Simple encryption using XOR (NOT for production use)
    const jsonString = JSON.stringify(data);
    const key = 'crazy-gary-cache-key';
    let encrypted = '';
    
    for (let i = 0; i < jsonString.length; i++) {
      encrypted += String.fromCharCode(
        jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return btoa(encrypted);
  }

  private async decryptData(encryptedData: string): Promise<any> {
    try {
      const encrypted = atob(encryptedData);
      const key = 'crazy-gary-cache-key';
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
          encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  // Performance monitoring
  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor storage usage
    setInterval(() => {
      this.monitorStorageUsage();
    }, 60000); // Every minute

    // Monitor cache performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name.includes('/assets/') || entry.name.includes('/static/')) {
            this.recordAssetPerformance(entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private monitorStorageUsage(): void {
    try {
      // Calculate storage usage
      const localStorageUsage = this.calculateStorageUsage('localStorage');
      const sessionStorageUsage = this.calculateStorageUsage('sessionStorage');
      
      // Log warnings if usage is high
      if (localStorageUsage > 4.5 * 1024 * 1024) { // 4.5MB warning
        console.warn('LocalStorage usage is high:', localStorageUsage);
      }
      
      if (sessionStorageUsage > 4.5 * 1024 * 1024) { // 4.5MB warning
        console.warn('SessionStorage usage is high:', sessionStorageUsage);
      }
    } catch (error) {
      console.warn('Storage monitoring failed:', error);
    }
  }

  private calculateStorageUsage(storageType: 'localStorage' | 'sessionStorage'): number {
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    let usage = 0;
    
    for (let key in storage) {
      if (storage.hasOwnProperty(key) && this.isAssetKey(key)) {
        usage += storage[key].length + key.length;
      }
    }
    
    return usage;
  }

  private recordAssetPerformance(entry: PerformanceEntry): void {
    // This would integrate with your monitoring system
    console.log('Asset performance:', {
      name: entry.name,
      duration: entry.duration,
      size: (entry as any).transferSize,
      type: entry.initiatorType
    });
  }

  private monitorCacheSize(): void {
    // Monitor and potentially clean up cache if it gets too large
    const totalSize = this.calculateStorageUsage('localStorage') + 
                     this.calculateStorageUsage('sessionStorage');
    
    if (totalSize > 9 * 1024 * 1024) { // 9MB limit
      console.warn('Cache size is approaching limit:', totalSize);
      this.cleanupOldCacheEntries();
    }
  }

  private cleanupOldCacheEntries(): void {
    try {
      // Clean up old entries based on timestamp
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      
      for (const storage of ['localStorage', 'sessionStorage']) {
        const store = storage === 'localStorage' ? localStorage : sessionStorage;
        const entries = Object.keys(store)
          .filter(key => this.isAssetKey(key))
          .map(key => {
            try {
              const data = JSON.parse(store.getItem(key) || '{}');
              return { key, timestamp: data.timestamp };
            } catch {
              return { key, timestamp: 0 };
            }
          })
          .filter(entry => entry.timestamp < cutoff)
          .sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest 50% of entries
        const toRemove = Math.ceil(entries.length * 0.5);
        for (let i = 0; i < toRemove; i++) {
          store.removeItem(entries[i].key);
        }
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  // Public API
  enableCompression(enabled: boolean): void {
    this.compressionEnabled = enabled;
  }

  enableEncryption(enabled: boolean): void {
    this.encryptionEnabled = enabled;
  }

  async getCacheStats(): Promise<{
    totalSize: number;
    assetCount: number;
    storageBreakdown: Record<string, { count: number; size: number }>;
    compressionRatio?: number;
  }> {
    const stats = {
      totalSize: 0,
      assetCount: 0,
      storageBreakdown: {} as Record<string, { count: number; size: number }>
    };

    for (const config of this.assetConfigs) {
      const keys = await this.getStoredKeys(config.storage);
      const size = keys.reduce((total, key) => {
        try {
          const store = config.storage === 'localStorage' ? localStorage : 
                       config.storage === 'sessionStorage' ? sessionStorage : null;
          if (store && store.getItem(key)) {
            return total + store.getItem(key)!.length;
          }
        } catch {
          // Skip invalid entries
        }
        return total;
      }, 0);

      stats.storageBreakdown[config.storage] = {
        count: keys.length,
        size
      };

      stats.totalSize += size;
      stats.assetCount += keys.length;
    }

    return stats;
  }

  async preloadAssets(urls: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const preloadPromises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.blob();
          const successResult = await this.cacheAsset(url, data);
          if (successResult) {
            success++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    });

    await Promise.all(preloadPromises);
    return { success, failed };
  }
}

// Export singleton instance
export const browserCache = BrowserCacheManager.getInstance();

// React hook for browser caching
export function useBrowserCache() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cacheAsset = useCallback(async (url: string, data: any, options?: any) => {
    return browserCache.cacheAsset(url, data, options);
  }, []);

  const getCachedAsset = useCallback(async (url: string) => {
    return browserCache.getCachedAsset(url);
  }, []);

  const invalidateAsset = useCallback(async (url: string) => {
    return browserCache.invalidateAsset(url);
  }, []);

  const clearCache = useCallback(async (pattern?: RegExp) => {
    return browserCache.clearAssetCache(pattern);
  }, []);

  const preloadAssets = useCallback(async (urls: string[]) => {
    return browserCache.preloadAssets(urls);
  }, []);

  const getCacheStats = useCallback(async () => {
    setLoading(true);
    try {
      const cacheStats = await browserCache.getCacheStats();
      setStats(cacheStats);
      return cacheStats;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCacheStats();
    
    // Update stats every 5 minutes
    const interval = setInterval(getCacheStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getCacheStats]);

  return {
    stats,
    loading,
    cacheAsset,
    getCachedAsset,
    invalidateAsset,
    clearCache,
    preloadAssets,
    getCacheStats
  };
}