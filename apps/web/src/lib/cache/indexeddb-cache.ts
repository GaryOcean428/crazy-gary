/**
 * Enhanced IndexedDB Cache Implementation
 * Provides advanced IndexedDB caching with complex queries, indexing, and transactions
 */

import { CacheBackend, CacheOptions, CacheEntry, CacheStats } from './cache-types';

interface IndexedDBCacheOptions extends CacheOptions {
  dbName?: string;
  storeName?: string;
  version?: number;
  keyPath?: string;
  indexes?: IndexedDBIndex[];
  autoIncrement?: boolean;
}

interface IndexedDBIndex {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

interface QueryOptions {
  indexName?: string;
  range?: IDBKeyRange | IDBValidKey;
  direction?: 'next' | 'prev' | 'nextunique' | 'prevunique';
  limit?: number;
  offset?: number;
}

interface TransactionOptions {
  mode?: 'readonly' | 'readwrite';
  durability?: 'relaxed' | 'strict';
}

export class IndexedDBCache implements CacheBackend {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;
  private version: number;
  private isInitialized = false;

  constructor(options: IndexedDBCacheOptions = {}) {
    this.dbName = options.dbName || 'CrazyGaryCache';
    this.storeName = options.storeName || 'cache';
    this.version = options.version || 1;
  }

  /**
   * Initialize the IndexedDB database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Delete existing store if it exists
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // Create object store with indexes
        const store = db.createObjectStore(this.storeName, {
          keyPath: 'key',
          autoIncrement: false
        });

        // Create default indexes
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('ttl', 'ttl', { unique: false });
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true });

        // Add custom indexes if provided
        if (this.storeName === 'cache') {
          // Add more sophisticated indexes for the main cache
          store.createIndex('keyPrefix', 'keyPrefix', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  /**
   * Get an item from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T>;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if entry has expired
        if (this.isExpired(entry)) {
          this.delete(key).catch(console.warn);
          resolve(null);
          return;
        }

        // Update access statistics
        this.updateAccessStats(key).catch(console.warn);

        resolve(entry.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set an item in cache
   */
  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    await this.ensureInitialized();

    const now = Date.now();
    const ttl = options?.ttl || 5 * 60 * 1000; // 5 minutes default
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      ttl,
      hits: 0,
      size: this.calculateSize(value),
      metadata: {
        ...options,
        lastAccessed: now,
        accessCount: 0
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete an item from cache
   */
  async delete(key: string): Promise<boolean> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all items from cache
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if a key exists in cache
   */
  async has(key: string): Promise<boolean> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count(key);

      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all keys in cache
   */
  async keys(): Promise<string[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache statistics
   */
  async stats(): Promise<CacheStats> {
    await this.ensureInitialized();

    const entries = await this.getAllEntries();
    const now = Date.now();
    
    let hits = 0;
    let totalSize = 0;
    let validEntries = 0;

    for (const entry of entries) {
      totalSize += entry.size || 0;
      
      if (!this.isExpired(entry)) {
        validEntries++;
        hits += entry.hits || 0;
      }
    }

    const totalRequests = hits; // Simplified - in real implementation, track separately

    return {
      hits,
      misses: 0, // Would need to track separately
      hitRate: totalRequests > 0 ? hits / (hits + 0) : 0, // Simplified
      totalSize,
      entryCount: entries.length,
      averageSize: entries.length > 0 ? totalSize / entries.length : 0
    };
  }

  /**
   * Advanced query methods
   */
  
  /**
   * Query entries by index
   */
  async queryByIndex(indexName: string, range?: IDBKeyRange, options?: QueryOptions): Promise<CacheEntry[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index(indexName);
      
      let request = index.openCursor(range, options?.direction);
      const results: CacheEntry[] = [];
      let offset = options?.offset || 0;
      let limit = options?.limit;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (!cursor) {
          resolve(results);
          return;
        }

        // Skip entries based on offset
        if (offset > 0) {
          offset--;
          cursor.continue();
          return;
        }

        const entry = cursor.value as CacheEntry;
        
        // Filter out expired entries
        if (!this.isExpired(entry)) {
          results.push(entry);
        }

        // Check limit
        if (limit && results.length >= limit) {
          resolve(results);
          return;
        }

        cursor.continue();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get entries by tag
   */
  async getByTag(tag: string): Promise<CacheEntry[]> {
    return this.queryByIndex('tags', IDBKeyRange.only(tag));
  }

  /**
   * Get expired entries
   */
  async getExpiredEntries(): Promise<CacheEntry[]> {
    const allEntries = await this.getAllEntries();
    return allEntries.filter(entry => this.isExpired(entry));
  }

  /**
   * Clean up expired entries
   */
  async cleanupExpired(): Promise<number> {
    const expiredEntries = await this.getExpiredEntries();
    
    await Promise.all(
      expiredEntries.map(entry => this.delete(entry.key))
    );

    return expiredEntries.length;
  }

  /**
   * Get least recently used entries
   */
  async getLRUEntries(limit: number = 10): Promise<CacheEntry[]> {
    return this.queryByIndex('timestamp', undefined, { 
      direction: 'prev', 
      limit 
    });
  }

  /**
   * Bulk operations
   */
  async bulkSet(entries: Record<string, any>, options?: CacheOptions): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      let completed = 0;
      const total = Object.keys(entries).length;

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      Object.entries(entries).forEach(([key, value]) => {
        const request = store.put({
          key,
          value,
          timestamp: Date.now(),
          ttl: options?.ttl || 5 * 60 * 1000,
          hits: 0,
          size: this.calculateSize(value),
          metadata: options
        });

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            // Transaction will complete naturally
          }
        };
      });
    });
  }

  async bulkDelete(keys: string[]): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      let completed = 0;
      const total = keys.length;

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      keys.forEach(key => {
        const request = store.delete(key);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            // Transaction will complete naturally
          }
        };
      });
    });
  }

  /**
   * Utility methods
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 0;
    }
  }

  private async getAllEntries(): Promise<CacheEntry[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as CacheEntry[]);
      request.onerror = () => reject(request.error);
    });
  }

  private async updateAccessStats(key: string): Promise<void> {
    try {
      const entry = await this.getEntry(key);
      if (entry) {
        entry.hits = (entry.hits || 0) + 1;
        entry.metadata = {
          ...entry.metadata,
          lastAccessed: Date.now(),
          accessCount: (entry.metadata?.accessCount || 0) + 1
        };
        await this.set(key, entry.value, { ttl: entry.ttl });
      }
    } catch (error) {
      console.warn('Failed to update access stats:', error);
    }
  }

  private async getEntry(key: string): Promise<CacheEntry | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result as CacheEntry || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get database info
   */
  async getDatabaseInfo(): Promise<{
    name: string;
    version: number;
    objectStores: string[];
    size: number;
  }> {
    await this.ensureInitialized();

    return {
      name: this.dbName,
      version: this.version,
      objectStores: Array.from(this.db!.objectStoreNames),
      size: await this.size()
    };
  }
}

// Export a singleton instance for the main cache
export const indexedDBCache = new IndexedDBCache();

// Export utility functions for working with IndexedDB cache
export const indexedDBCacheUtils = {
  /**
   * Create a new IndexedDB cache with custom configuration
   */
  create: (options: IndexedDBCacheOptions) => new IndexedDBCache(options),

  /**
   * Check if IndexedDB is supported
   */
  isSupported: () => 'indexedDB' in window,

  /**
   * Get storage quota information
   */
  async getStorageQuota(): Promise<{
    usage: number;
    quota: number;
    usageDetails?: StorageEstimate;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usageDetails: estimate
      };
    }
    
    return { usage: 0, quota: 0 };
  },

  /**
   * Clear all IndexedDB databases
   */
  async clearAllDatabases(): Promise<void> {
    if ('databases' in indexedDB) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise<void>((resolve) => {
              const request = indexedDB.deleteDatabase(db.name!);
              request.onsuccess = () => resolve();
              request.onerror = () => resolve(); // Ignore errors
            });
          }
          return Promise.resolve();
        })
      );
    }
  }
};