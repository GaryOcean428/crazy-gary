# Advanced Caching System for Crazy Gary App

A comprehensive caching implementation with multi-backend support, offline capabilities, and performance optimization.

## 🚀 Features

### Core Caching
- **Multi-Backend Support**: Memory, localStorage, sessionStorage, IndexedDB
- **Redis-like API**: Familiar cache operations (get, set, del, exists, etc.)
- **Advanced Strategies**: Cache-first, network-first, stale-while-revalidate
- **TTL & Size Limits**: Configurable expiration and storage limits
- **LRU Eviction**: Least Recently Used cache eviction policy

### API Response Caching
- **Automatic Interception**: Axios request/response caching
- **Strategy-Based**: Different caching strategies per endpoint
- **Background Refresh**: Stale data revalidation
- **Conditional Requests**: ETag and Last-Modified support

### Service Worker Integration
- **Offline Support**: Full offline functionality
- **Background Sync**: Queue requests for when online
- **Push Notifications**: Cache invalidation via push
- **Asset Preloading**: Strategic cache warming

### Browser Asset Caching
- **Static Assets**: Images, fonts, CSS, JS files
- **Compression**: Automatic data compression
- **Cache Headers**: HTTP cache control optimization
- **Storage Management**: Quota monitoring and cleanup

### Performance Monitoring
- **Real-time Analytics**: Hit rates, latency, memory usage
- **Alert System**: Performance threshold alerts
- **Trend Analysis**: Performance trend tracking
- **Efficiency Metrics**: Cache efficiency scoring

### Cache Warming
- **Eager Loading**: Critical resources preloaded
- **Lazy Loading**: On-demand cache population
- **Background Loading**: Non-critical resources
- **Predictive Loading**: ML-based cache prediction

## 📦 Installation

The caching system is already integrated into the Crazy Gary app. No additional installation required.

## 🎯 Quick Start

### Basic Cache Operations

```typescript
import { cache, cacheUtils } from '@/lib/cache';

// Quick cache operations
await cache.set('user:123', { name: 'John', email: 'john@example.com' });
const user = await cache.get('user:123');
await cache.delete('user:123');

// Utility functions
await cacheUtils.set('session:token', 'abc123');
const token = await cacheUtils.get('session:token', 'default-token');
```

### API Caching

```typescript
import { useApiCache } from '@/lib/cache';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, refresh } = useApiCache(
    `/api/users/${userId}`,
    {
      strategy: 'stale-while-revalidate',
      staleWhileRevalidate: true,
      backgroundRefresh: true
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Cache Invalidation

```typescript
import { invalidateCache } from '@/lib/cache';

// Invalidate by pattern
await invalidateCache.pattern('user:*');

// Invalidate by tag
await invalidateCache.byTag('user-data');

// Smart invalidation based on usage
await invalidateCache.smart('user:123', {
  lastAccessed: Date.now() - 3600000, // 1 hour ago
  accessFrequency: 5, // 5 accesses per hour
  dataFreshness: 0.8 // 80% fresh
});
```

## 🛠 Advanced Usage

### Custom Cache Backend

```typescript
import { cacheManager } from '@/lib/cache';

// Register custom cache backend
class CustomCache implements CacheBackend {
  async get<T = any>(key: string): Promise<T | null> {
    // Custom implementation
    return null;
  }
  
  async set<T = any>(key: string, value: T): Promise<boolean> {
    // Custom implementation
    return true;
  }
  
  // ... other methods
}

cacheManager.registerCache('custom', new CustomCache());
```

### Service Worker Cache Management

```typescript
import { useCacheManager } from '@/lib/cache/service-worker-hooks';

function CacheControls() {
  const { warmupCache, invalidateCache, clearCache, getCacheStats } = useCacheManager();
  
  const handleWarmup = async () => {
    await warmupCache([
      '/api/user/profile',
      '/api/navigation/menu',
      '/static/icons/app-icon.svg'
    ]);
  };
  
  const handleInvalidate = async () => {
    const count = await invalidateCache('user:*');
    console.log(`Invalidated ${count} entries`);
  };
  
  return (
    <div>
      <button onClick={handleWarmup}>Warmup Cache</button>
      <button onClick={handleInvalidate}>Invalidate User Cache</button>
    </div>
  );
}
```

### Performance Monitoring

```typescript
import { useCacheMonitoring } from '@/lib/cache/cache-monitoring';

function PerformanceDashboard() {
  const { metrics, alerts, performanceReport } = useCacheMonitoring();
  
  return (
    <div>
      <h2>Cache Performance</h2>
      <div>Hit Rate: {(performanceReport?.summary.averageHitRate * 100).toFixed(1)}%</div>
      <div>Average Latency: {performanceReport?.summary.averageLatency.toFixed(2)}ms</div>
      <div>Memory Usage: {(performanceReport?.summary.memoryUsage * 100).toFixed(1)}%</div>
      
      {alerts.length > 0 && (
        <div>
          <h3>Alerts</h3>
          {alerts.map(alert => (
            <div key={alert.id} className={`alert ${alert.severity}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 📊 Cache Configuration

### Environment-Based Config

```typescript
// Automatic configuration based on environment
const config = getCacheConfig();

// Development - shorter TTL, smaller caches
// Production - longer TTL, larger caches
```

### Custom Configuration

```typescript
import { CACHE_CONFIGS } from '@/lib/cache/cache-config';

// Override specific configurations
CACHE_CONFIGS.memory.ttl = 30 * 60 * 1000; // 30 minutes
CACHE_CONFIGS.api.maxSize = 200; // 200 entries
```

## 🔧 Cache Strategies

### Cache-First Strategy
- **Use Case**: Static assets, configuration data
- **Behavior**: Serve from cache, fallback to network
- **TTL**: Long (hours to days)

### Network-First Strategy
- **Use Case**: Real-time data, user profiles
- **Behavior**: Try network first, fallback to cache
- **Timeout**: 5-10 seconds
- **TTL**: Medium (minutes)

### Stale-While-Revalidate
- **Use Case**: News feeds, activity streams
- **Behavior**: Serve cache immediately, refresh in background
- **TTL**: Short (minutes)

## 📱 Progressive Web App Features

### Service Worker Registration
```typescript
import { useServiceWorker } from '@/lib/cache/service-worker-hooks';

function App() {
  const swStatus = useServiceWorker();
  
  return (
    <div>
      {swStatus.updateAvailable && (
        <button onClick={() => window.location.reload()}>
          Update Available - Click to Refresh
        </button>
      )}
    </div>
  );
}
```

### Background Sync
```typescript
import { useBackgroundSync } from '@/lib/cache/service-worker-hooks';

function OfflineActions() {
  const { registerSync, isSupported } = useBackgroundSync();
  
  const handleOfflineAction = async () => {
    if (isSupported) {
      await registerSync('sync-data', { action: 'upload', data: formData });
      console.log('Action queued for sync when online');
    }
  };
  
  return <button onClick={handleOfflineAction}>Queue Action</button>;
}
```

## 🎛 Cache Management

### Cache Warming
```typescript
import { cacheWarmupService } from '@/lib/cache/cache-warming';

// Start all warming strategies
await cacheWarmupService.startAllWarmup();

// Start specific warming
await cacheWarmupService.warmupCache('predictive');

// Get warming status
const status = await cacheWarmupService.getWarmupStatus();
```

### Cache Statistics
```typescript
import { cache } from '@/lib/cache';

// Get cache statistics
const stats = await cache.stats();
console.log(`Hit Rate: ${stats.hitRate * 100}%`);
console.log(`Total Size: ${stats.totalSize} bytes`);
console.log(`Entry Count: ${stats.entryCount}`);
```

## 🚨 Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```typescript
   // Clear all caches
   await cache.clear();
   
   // Clear specific cache type
   await cache.clear('localStorage');
   ```

2. **Low Hit Rate**
   ```typescript
   // Increase TTL for frequently accessed data
   await cache.set('key', data, { ttl: 15 * 60 * 1000 }); // 15 minutes
   ```

3. **Cache Staleness**
   ```typescript
   // Force refresh
   await cache.delete('key');
   await cache.set('key', freshData);
   ```

### Debug Mode
```typescript
import { cacheMonitoring } from '@/lib/cache/cache-monitoring';

// Enable debug logging
cacheMonitoring.recordMetric('debug', 1);

// Get performance report
const report = cacheMonitoring.getPerformanceReport();
console.log('Performance Report:', report);
```

## 📈 Performance Optimization

### Best Practices

1. **Cache Key Naming**
   ```typescript
   // Good: Specific, namespaced keys
   'user:profile:123'
   'api:users:list:page-1'
   'static:icons:user-avatar'
   
   // Bad: Generic keys
   'data'
   'info'
   'cache'
   ```

2. **TTL Configuration**
   ```typescript
   // Static assets: 24 hours
   'static:assets': 24 * 60 * 60 * 1000
   
   // User data: 30 minutes
   'user:data': 30 * 60 * 1000
   
   // API responses: 5 minutes
   'api:responses': 5 * 60 * 1000
   ```

3. **Memory Management**
   ```typescript
   // Monitor cache size
   const stats = await cache.stats();
   if (stats.entryCount > 1000) {
     await cache.clear(); // Clear if too large
   }
   ```

## 🔐 Security Considerations

- **Sensitive Data**: Use encryption for user data
- **Cache Invalidation**: Implement proper invalidation on user actions
- **Storage Limits**: Monitor localStorage usage (5-10MB limit)
- **HTTPS**: Required for service worker functionality

## 📝 API Reference

### CacheManager
- `get<T>(key: string, backend?: string): Promise<T | null>`
- `set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>`
- `delete(key: string, backend?: string): Promise<boolean>`
- `clear(backend?: string): Promise<void>`
- `has(key: string, backend?: string): Promise<boolean>`
- `stats(backend?: string): Promise<CacheStats>`

### Cache Hooks
- `useCache<T>(key: string, options?: UseCacheOptions<T>)`
- `useApiCache<T>(url: string, options?: UseApiCacheOptions<T>)`
- `usePaginatedCache<T>(baseKey: string, options?: UsePaginatedCacheOptions<T>)`
- `useRealtimeCache<T>(key: string, fetchFn: () => Promise<T>, options?: UseRealtimeCacheOptions<T>)`

### Service Worker Hooks
- `useServiceWorker(): ServiceWorkerStatus`
- `useOfflineStatus(): OfflineStatus`
- `useCacheManager(): CacheManager`
- `useProgressiveWebApp(): PWAFeatures`
- `useBackgroundSync(): BackgroundSync`

## 🎯 Testing

Visit `/cache-demo` or `/cache-test` routes to test all caching features:

- Basic cache operations
- API caching strategies
- Service worker functionality
- Offline capabilities
- Performance monitoring
- Cache invalidation
- Background sync

## 🤝 Contributing

The caching system is modular and extensible. To add new features:

1. Add new cache backend in appropriate files
2. Update cache configuration
3. Add React hooks if needed
4. Update documentation
5. Test thoroughly

## 📄 License

This caching system is part of the Crazy Gary application and follows the same license terms.