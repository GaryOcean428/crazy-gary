/**
 * Service Worker for offline support and advanced caching
 */

const CACHE_NAME = 'crazy-gary-v1.0.0';
const STATIC_CACHE = 'static-cache-v1.0.0';
const API_CACHE = 'api-cache-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-cache-v1.0.0';

// Cache strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only'
} as const;

// Cache configuration
const CACHE_CONFIG = {
  // Static assets
  static: {
    maxEntries: 50,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    strategy: STRATEGIES.CACHE_FIRST
  },
  
  // API responses
  api: {
    maxEntries: 100,
    maxAge: 5 * 60 * 1000, // 5 minutes
    strategy: STRATEGIES.NETWORK_FIRST,
    timeout: 8000
  },
  
  // Dynamic content
  dynamic: {
    maxEntries: 200,
    maxAge: 15 * 60 * 1000, // 15 minutes
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE
  },
  
  // Offline pages
  offline: {
    pages: ['/', '/offline', '/login'],
    strategy: STRATEGIES.CACHE_FIRST
  }
};

// Cache patterns and their strategies
const CACHE_PATTERNS = [
  {
    pattern: /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
    cache: STATIC_CACHE,
    config: CACHE_CONFIG.static
  },
  {
    pattern: /\/api\/static\/|\/static\//,
    cache: STATIC_CACHE,
    config: CACHE_CONFIG.static
  },
  {
    pattern: /\/api\/.*/,
    cache: API_CACHE,
    config: CACHE_CONFIG.api
  },
  {
    pattern: /\/.*/,
    cache: DYNAMIC_CACHE,
    config: CACHE_CONFIG.dynamic
  }
];

class ServiceWorkerCache {
  private cacheManager: Map<string, Cache> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Install event
    self.addEventListener('install', (event) => {
      console.log('Service Worker installing...');
      this.handleInstall(event);
    });

    // Activate event
    self.addEventListener('activate', (event) => {
      console.log('Service Worker activating...');
      this.handleActivate(event);
    });

    // Fetch event
    self.addEventListener('fetch', (event) => {
      this.handleFetch(event);
    });

    // Message event for cache management
    self.addEventListener('message', (event) => {
      this.handleMessage(event);
    });

    // Background sync event
    self.addEventListener('sync', (event) => {
      this.handleBackgroundSync(event);
    });

    // Push event for notifications
    self.addEventListener('push', (event) => {
      this.handlePush(event);
    });
  }

  private async handleInstall(event: ExtendableEvent): Promise<void> {
    event.waitUntil(
      Promise.all([
        // Cache static assets
        this.cacheStaticAssets(),
        // Cache offline pages
        this.cacheOfflinePages(),
        // Initialize cache managers
        this.initializeCaches()
      ]).then(() => {
        console.log('Service Worker installed successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
    );
  }

  private async handleActivate(event: ExtendableEvent): Promise<void> {
    event.waitUntil(
      Promise.all([
        // Clean up old caches
        this.cleanupOldCaches(),
        // Claim all clients
        this.claimClients()
      ]).then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
    );
  }

  private async handleFetch(event: FetchEvent): Promise<void> {
    const { request } = event;
    
    // Skip non-GET requests and chrome-extension requests
    if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
      return;
    }

    // Skip caching for specific paths
    if (this.shouldSkipCache(request.url)) {
      return;
    }

    event.respondWith(this.processRequest(request));
  }

  private async handleMessage(event: ExtendableMessageEvent): Promise<void> {
    const { data } = event;
    
    switch (data.type) {
      case 'CACHE_WARMUP':
        await this.warmupCache(data.payload);
        break;
        
      case 'CACHE_INVALIDATE':
        await this.invalidateCache(data.payload);
        break;
        
      case 'CACHE_CLEAR':
        await this.clearCache(data.payload);
        break;
        
      case 'CACHE_STATS':
        const stats = await this.getCacheStats();
        event.ports[0].postMessage({ type: 'CACHE_STATS_RESPONSE', data: stats });
        break;
        
      case 'OFFLINE_FALLBACK':
        const fallback = await this.getOfflineFallback(data.payload.url);
        event.ports[0].postMessage({ type: 'OFFLINE_FALLBACK_RESPONSE', data: fallback });
        break;
    }
  }

  private async handleBackgroundSync(event: any): Promise<void> {
    if (event.tag.startsWith('refresh-')) {
      event.waitUntil(this.refreshCacheEntry(event.tag.substring(8)));
    }
  }

  private async handlePush(event: PushEvent): Promise<void> {
    if (!event.data) return;

    try {
      const data = event.data.json();
      
      // Show notification
      const options = {
        body: data.body || 'New update available',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: data.tag || 'default',
        data: data.url ? { url: data.url } : undefined
      };

      await self.registration.showNotification(data.title || 'App Update', options);
    } catch (error) {
      console.error('Push event handling error:', error);
    }
  }

  private async processRequest(request: Request): Promise<Response> {
    const cacheConfig = this.getCacheConfig(request.url);
    if (!cacheConfig) {
      return fetch(request);
    }

    try {
      switch (cacheConfig.config.strategy) {
        case STRATEGIES.CACHE_FIRST:
          return this.cacheFirstStrategy(request, cacheConfig);
          
        case STRATEGIES.NETWORK_FIRST:
          return this.networkFirstStrategy(request, cacheConfig);
          
        case STRATEGIES.STALE_WHILE_REVALIDATE:
          return this.staleWhileRevalidateStrategy(request, cacheConfig);
          
        case STRATEGIES.CACHE_ONLY:
          return this.cacheOnlyStrategy(request, cacheConfig);
          
        case STRATEGIES.NETWORK_ONLY:
          return fetch(request);
          
        default:
          return fetch(request);
      }
    } catch (error) {
      console.error('Cache strategy error:', error);
      
      // Fallback to offline page for navigation requests
      if (request.mode === 'navigate') {
        return this.getOfflineFallback(request.url);
      }
      
      throw error;
    }
  }

  private async cacheFirstStrategy(request: Request, cacheConfig: any): Promise<Response> {
    const cache = await this.getCache(cacheConfig.cache);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      await this.cacheResponse(cache, request, response, cacheConfig.config.maxAge);
    }
    
    return response;
  }

  private async networkFirstStrategy(request: Request, cacheConfig: any): Promise<Response> {
    const cache = await this.getCache(cacheConfig.cache);
    
    try {
      // Set timeout for network request
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), cacheConfig.config.timeout || 5000);
      });
      
      const response = await Promise.race([fetch(request), timeoutPromise]);
      
      if (response.ok) {
        await this.cacheResponse(cache, request, response, cacheConfig.config.maxAge);
      }
      
      return response;
    } catch (error) {
      // Network failed, try cache
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  private async staleWhileRevalidateStrategy(request: Request, cacheConfig: any): Promise<Response> {
    const cache = await this.getCache(cacheConfig.cache);
    const cached = await cache.match(request);
    
    // Start network request in background
    const networkPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        await this.cacheResponse(cache, request, response, cacheConfig.config.maxAge);
      }
      return response;
    });
    
    // Return cached response immediately if available
    if (cached) {
      return cached;
    }
    
    // No cached response, wait for network
    return networkPromise;
  }

  private async cacheOnlyStrategy(request: Request, cacheConfig: any): Promise<Response> {
    const cache = await this.getCache(cacheConfig.cache);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw new Error('Resource not found in cache');
  }

  private async cacheResponse(cache: Cache, request: Request, response: Response, maxAge: number): Promise<void> {
    try {
      const responseClone = response.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-max-age', maxAge.toString());
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers
      });
      
      await cache.put(request, modifiedResponse);
      
      // Clean up old entries if cache is getting too large
      await this.cleanupCache(cache, CACHE_PATTERNS.find(p => p.cache === cache.name)?.config.maxEntries || 100);
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }

  private getCacheConfig(url: string): any {
    return CACHE_PATTERNS.find(pattern => pattern.pattern.test(url));
  }

  private shouldSkipCache(url: string): boolean {
    const skipPatterns = [
      /\/api\/auth\/.*/,
      /\/api\/upload/,
      /\/api\/logout/,
      /\/socket\.io/,
      /chrome-extension/
    ];
    
    return skipPatterns.some(pattern => pattern.test(url));
  }

  private async getCache(name: string): Promise<Cache> {
    if (!this.cacheManager.has(name)) {
      const cache = await caches.open(name);
      this.cacheManager.set(name, cache);
    }
    
    return this.cacheManager.get(name)!;
  }

  private async cacheStaticAssets(): Promise<void> {
    const cache = await this.getCache(STATIC_CACHE);
    const staticAssets = [
      '/',
      '/offline',
      '/manifest.json',
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
    ];
    
    const cachePromises = staticAssets.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn(`Failed to cache static asset: ${url}`, error);
      }
    });
    
    await Promise.all(cachePromises);
  }

  private async cacheOfflinePages(): Promise<void> {
    const cache = await this.getCache(DYNAMIC_CACHE);
    
    // Cache navigation pages
    const pages = ['/', '/offline', '/login', '/dashboard'];
    
    for (const page of pages) {
      try {
        const response = await fetch(page);
        if (response.ok) {
          await cache.put(page, response.clone());
        }
      } catch (error) {
        console.warn(`Failed to cache offline page: ${page}`, error);
      }
    }
  }

  private async initializeCaches(): Promise<void> {
    // Initialize all cache types
    await Promise.all([
      this.getCache(STATIC_CACHE),
      this.getCache(API_CACHE),
      this.getCache(DYNAMIC_CACHE)
    ]);
  }

  private async cleanupOldCaches(): Promise<void> {
    const cacheNames = [STATIC_CACHE, API_CACHE, DYNAMIC_CACHE];
    const cachesToDelete = [];
    
    for (const cacheName of await caches.keys()) {
      if (!cacheNames.includes(cacheName)) {
        cachesToDelete.push(cacheName);
      }
    }
    
    await Promise.all(cachesToDelete.map(name => caches.delete(name)));
  }

  private async claimClients(): Promise<void> {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    
    for (const client of clients) {
      client.postMessage({
        type: 'SW_ACTIVATED',
        data: { cacheVersion: CACHE_NAME }
      });
    }
  }

  private async cleanupCache(cache: Cache, maxEntries: number): Promise<void> {
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      // Sort by timestamp (oldest first)
      const entries = await Promise.all(
        keys.map(async (key) => {
          const response = await cache.match(key);
          const timestamp = response?.headers.get('sw-cache-timestamp');
          return { key, timestamp: timestamp ? parseInt(timestamp) : 0 };
        })
      );
      
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest entries
      const toDelete = entries.slice(0, keys.length - maxEntries);
      await Promise.all(toDelete.map(entry => cache.delete(entry.key)));
    }
  }

  private async refreshCacheEntry(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const cacheConfig = this.getCacheConfig(url);
        if (cacheConfig) {
          const cache = await this.getCache(cacheConfig.cache);
          await this.cacheResponse(cache, new Request(url), response, cacheConfig.config.maxAge);
        }
      }
    } catch (error) {
      console.warn(`Failed to refresh cache entry: ${url}`, error);
    }
  }

  private async getOfflineFallback(url: string): Promise<Response> {
    // Try to get cached offline page
    const offlineCache = await this.getCache(DYNAMIC_CACHE);
    const offlinePage = await offlineCache.match('/offline');
    
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback to basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>You're offline</h1>
          <p>Please check your internet connection and try again.</p>
        </body>
      </html>
      `,
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }

  // Public methods for cache management
  async warmupCache(urls: string[]): Promise<void> {
    const cachePromises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const cacheConfig = this.getCacheConfig(url);
          if (cacheConfig) {
            const cache = await this.getCache(cacheConfig.cache);
            await this.cacheResponse(cache, new Request(url), response, cacheConfig.config.maxAge);
          }
        }
      } catch (error) {
        console.warn(`Failed to warmup cache: ${url}`, error);
      }
    });
    
    await Promise.all(cachePromises);
  }

  async invalidateCache(pattern: string): Promise<void> {
    const cacheNames = [STATIC_CACHE, API_CACHE, DYNAMIC_CACHE];
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    for (const cacheName of cacheNames) {
      const cache = await this.getCache(cacheName);
      const keys = await cache.keys();
      
      const deletePromises = keys
        .filter(request => regex.test(request.url))
        .map(request => cache.delete(request));
      
      await Promise.all(deletePromises);
    }
  }

  async clearCache(cacheName?: string): Promise<void> {
    if (cacheName) {
      const cache = await this.getCache(cacheName);
      await cache.clear();
    } else {
      // Clear all caches
      const cacheNames = [STATIC_CACHE, API_CACHE, DYNAMIC_CACHE];
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }

  async getCacheStats(): Promise<any> {
    const stats: any = {};
    
    for (const [name, cache] of this.cacheManager.entries()) {
      const keys = await cache.keys();
      let totalSize = 0;
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const arrayBuffer = await response.arrayBuffer();
          totalSize += arrayBuffer.byteLength;
        }
      }
      
      stats[name] = {
        entries: keys.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    }
    
    return stats;
  }
}

// Initialize the service worker cache
const swCache = new ServiceWorkerCache();

// Export for testing
export { ServiceWorkerCache, swCache };