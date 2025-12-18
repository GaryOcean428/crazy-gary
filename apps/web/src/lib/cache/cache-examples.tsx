/**
 * Cache Integration Examples and Demo
 * Demonstrates all caching features and strategies
 */

import React, { useState, useEffect } from 'react';
import { 
  useCache, 
  useApiCache, 
  usePaginatedCache, 
  useRealtimeCache, 
  useCacheStats,
  useCacheInvalidation 
} from './cache-hooks';
import { 
  useServiceWorker, 
  useOfflineStatus, 
  useCacheManager,
  useProgressiveWebApp,
  useBackgroundSync 
} from './service-worker-hooks';
import { useBrowserCache } from './browser-cache';
import { cacheManager, cache } from './cache-manager';
import { cacheInvalidationManager, emitInvalidationEvent } from './cache-invalidation';
import { cacheMonitoring } from './cache-monitoring';
import { cacheWarmupService } from './cache-warming';

// Demo component showcasing all caching features
export const CacheDemo: React.FC = () => {
  // Basic cache usage
  const userCache = useCache('user:profile:123', {
    ttl: 5 * 60 * 1000,
    staleWhileRevalidate: true
  });

  // API cache usage
  const apiCache = useApiCache('/api/users', {
    strategy: 'network-first',
    staleWhileRevalidate: true,
    backgroundRefresh: true
  });

  // Paginated cache
  const paginatedCache = usePaginatedCache('users', {
    pageSize: 10,
    prefetchNextPage: true
  });

  // Real-time cache
  const realtimeCache = useRealtimeCache('dashboard:metrics', 
    () => fetch('/api/metrics').then(r => r.json()),
    { refreshInterval: 30000 }
  );

  // Service Worker hooks
  const swStatus = useServiceWorker();
  const offlineStatus = useOfflineStatus();
  const cacheManager = useCacheManager();
  const pwa = useProgressiveWebApp();
  const bgSync = useBackgroundSync();

  // Browser cache
  const browserCache = useBrowserCache();

  // Cache monitoring
  const cacheStats = useCacheStats();
  const cacheInvalidation = useCacheInvalidation();

  // Local state
  const [testData, setTestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cache statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await cacheManager.getCacheStats();
        console.log('Cache Stats:', stats);
      } catch (error) {
        console.error('Failed to load cache stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [cacheManager]);

  // Demo functions
  const testBasicCache = async () => {
    setIsLoading(true);
    try {
      // Test basic cache operations
      await cache.set('demo:test', { message: 'Hello Cache!', timestamp: Date.now() });
      const retrieved = await cache.get('demo:test');
      setTestData(retrieved);
    } catch (error) {
      console.error('Basic cache test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiCache = async () => {
    setIsLoading(true);
    try {
      // Test API cache
      await apiCache.refresh();
    } catch (error) {
      console.error('API cache test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCacheInvalidation = async () => {
    try {
      // Test pattern invalidation
      const invalidated = await cacheInvalidation.invalidatePattern('demo:*');
      console.log(`Invalidated ${invalidated} cache entries`);
      
      // Emit invalidation event
      emitInvalidationEvent('demo-invalidation', { reason: 'Manual test' });
    } catch (error) {
      console.error('Cache invalidation test failed:', error);
    }
  };

  const testCacheWarmup = async () => {
    try {
      await cacheWarmupService.warmupCache('eager');
      console.log('Cache warmup completed');
    } catch (error) {
      console.error('Cache warmup test failed:', error);
    }
  };

  const testBrowserCache = async () => {
    try {
      // Test browser cache
      await browserCache.cacheAsset('/demo-asset', { test: 'data' });
      const cached = await browserCache.getCachedAsset('/demo-asset');
      setTestData(cached);
    } catch (error) {
      console.error('Browser cache test failed:', error);
    }
  };

  const testBackgroundSync = async () => {
    try {
      if (bgSync.isSupported) {
        const success = await bgSync.registerSync('demo-sync', { test: 'data' });
        console.log('Background sync registered:', success);
      } else {
        console.log('Background sync not supported');
      }
    } catch (error) {
      console.error('Background sync test failed:', error);
    }
  };

  return (
    <div className="cache-demo p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Cache Demo & Testing</h1>

      {/* Service Worker Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-3">Service Worker Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Supported: <span className="font-mono">{swStatus.supported ? '✅' : '❌'}</span></div>
          <div>Registered: <span className="font-mono">{swStatus.registered ? '✅' : '❌'}</span></div>
          <div>Active: <span className="font-mono">{swStatus.active ? '✅' : '❌'}</span></div>
          <div>Update Available: <span className="font-mono">{swStatus.updateAvailable ? '⚠️' : '✅'}</span></div>
          <div>Offline Ready: <span className="font-mono">{swStatus.offlineReady ? '✅' : '❌'}</span></div>
        </div>
      </div>

      {/* Offline Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-3">Offline Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Is Offline: <span className={`font-mono ${offlineStatus.isOffline ? 'text-red-600' : 'text-green-600'}`}>
            {offlineStatus.isOffline ? 'Yes' : 'No'}
          </span></div>
          <div>Connection: <span className="font-mono">{offlineStatus.connectionType || 'Unknown'}</span></div>
          <div>Was Offline: <span className="font-mono">{offlineStatus.wasOffline ? 'Yes' : 'No'}</span></div>
          <div>Is Online: <span className="font-mono">{!offlineStatus.isOffline ? 'Yes' : 'No'}</span></div>
        </div>
      </div>

      {/* Cache Statistics */}
      {cacheStats.stats && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-3">Cache Statistics</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>Hit Rate: <span className="font-mono">{(cacheStats.stats.hitRate * 100).toFixed(1)}%</span></div>
            <div>Total Size: <span className="font-mono">{cacheStats.stats.totalSize} bytes</span></div>
            <div>Entry Count: <span className="font-mono">{cacheStats.stats.entryCount}</span></div>
          </div>
        </div>
      )}

      {/* Browser Cache Statistics */}
      {browserCache.stats && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-3">Browser Cache Statistics</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>Total Size: <span className="font-mono">{browserCache.stats.totalSize} bytes</span></div>
            <div>Asset Count: <span className="font-mono">{browserCache.stats.assetCount}</span></div>
            <div>Storage Breakdown: <span className="font-mono text-xs">
              {Object.entries(browserCache.stats.storageBreakdown).map(([storage, stats]) => 
                `${storage}:${stats.count}`
              ).join(', ')}
            </span></div>
          </div>
        </div>
      )}

      {/* Cache Loading States */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-3">Cache Loading States</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>User Cache: <span className="font-mono">{userCache.loading ? 'Loading...' : 'Ready'}</span></div>
          <div>API Cache: <span className="font-mono">{apiCache.loading ? 'Loading...' : 'Ready'}</span></div>
          <div>Realtime Cache: <span className="font-mono">{realtimeCache.loading ? 'Loading...' : 'Ready'}</span></div>
          <div>Browser Cache: <span className="font-mono">{browserCache.loading ? 'Loading...' : 'Ready'}</span></div>
        </div>
      </div>

      {/* Cache Data Display */}
      {testData && (
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h2 className="text-xl font-semibold mb-3">Test Data</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(testData, null, 2)}</pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={testBasicCache}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Basic Cache
        </button>

        <button
          onClick={testApiCache}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test API Cache
        </button>

        <button
          onClick={testCacheInvalidation}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Test Invalidation
        </button>

        <button
          onClick={testCacheWarmup}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Warmup
        </button>

        <button
          onClick={testBrowserCache}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          Test Browser Cache
        </button>

        <button
          onClick={testBackgroundSync}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Background Sync
        </button>
      </div>

      {/* PWA Actions */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-3">PWA Actions</h2>
        <div className="flex flex-wrap gap-4">
          {pwa.isInstallable && (
            <button
              onClick={pwa.installApp}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Install App
            </button>
          )}
          
          {pwa.hasUpdate && (
            <button
              onClick={pwa.updateApp}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Update App
            </button>
          )}

          <button
            onClick={async () => {
              const stats = await cacheManager.getCacheStats();
              console.log('Cache Manager Stats:', stats);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Get Cache Stats
          </button>
        </div>
      </div>

      {/* Performance Report */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-3">Performance Report</h2>
        <PerformanceReport />
      </div>
    </div>
  );
};

// Performance Report Component
const PerformanceReport: React.FC = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const performanceReport = cacheMonitoring.getPerformanceReport();
        setReport(performanceReport);
      } catch (error) {
        console.error('Failed to load performance report:', error);
      }
    };

    loadReport();
    const interval = setInterval(loadReport, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (!report) return <div>Loading performance report...</div>;

  return (
    <div className="text-sm">
      <h3 className="font-semibold mb-2">Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>Operations: <span className="font-mono">{report.summary.totalOperations}</span></div>
        <div>Hit Rate: <span className="font-mono">{(report.summary.averageHitRate * 100).toFixed(1)}%</span></div>
        <div>Latency: <span className="font-mono">{report.summary.averageLatency.toFixed(2)}ms</span></div>
        <div>Memory: <span className="font-mono">{(report.summary.memoryUsage * 100).toFixed(1)}%</span></div>
      </div>

      <h3 className="font-semibold mb-2">Trends</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>Hit Rate: <span className="font-mono">{report.trends.hitRateTrend}</span></div>
        <div>Latency: <span className="font-mono">{report.trends.latencyTrend}</span></div>
        <div>Memory: <span className="font-mono">{report.trends.memoryTrend}</span></div>
      </div>

      {report.recommendations.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-1">
            {report.recommendations.map((rec: string, index: number) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

// Example component using cache hooks in a real application
export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: profile, loading, error, refresh } = useApiCache(
    `/api/users/${userId}`,
    {
      strategy: 'stale-while-revalidate',
      staleWhileRevalidate: true,
      backgroundRefresh: true
    }
  );

  const { invalidatePattern } = useCacheInvalidation();

  const handleUpdateProfile = async (updates: any) => {
    try {
      // Update profile via API
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      // Invalidate related cache entries
      await invalidatePattern(`user:${userId}:*`);
      
      // Refresh the cache
      refresh();
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile: {error.message}</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div className="user-profile">
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
      <button onClick={() => handleUpdateProfile({ name: 'New Name' })}>
        Update Profile
      </button>
    </div>
  );
};

// Example component using paginated cache
export const UserList: React.FC = () => {
  const {
    data: users,
    loading,
    error,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage
  } = usePaginatedCache('users', {
    pageSize: 20,
    prefetchNextPage: true
  });

  if (loading && users.length === 0) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="user-list">
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default CacheDemo;