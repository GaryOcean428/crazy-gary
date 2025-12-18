/**
 * Advanced Caching System Demo Component
 * Demonstrates all caching features including decorators, error handling, performance monitoring, etc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  // Basic caching
  useCache, 
  useApiCache, 
  usePaginatedCache, 
  useRealtimeCache,
  
  // Service Worker
  useServiceWorker, 
  useOfflineStatus, 
  useCacheManager,
  
  // Advanced features
  advancedCacheUtils,
  cacheUtils,
  initializeCaching
} from '../cache';

// Demo user service with caching decorators
class UserService {
  @advancedCacheUtils.decorators.cached({
    ttl: 5 * 60 * 1000, // 5 minutes
    tags: ['user', 'profile']
  })
  async getUserProfile(userId: string) {
    console.log(`Fetching user profile for ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      createdAt: new Date().toISOString()
    };
  }

  @advancedCacheUtils.decorators.cacheApi({
    ttl: 10 * 60 * 1000, // 10 minutes
    keyGenerator: (url: string) => `api:${url}`
  })
  async fetchUserData(url: string) {
    console.log(`API call to ${url}...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { url, data: `Data from ${url}`, timestamp: Date.now() };
  }

  @advancedCacheUtils.decorators.invalidateCacheOn({
    invalidatePatterns: ['user:*', 'api:users:*'],
    invalidateTags: ['user-data']
  })
  async updateUser(userId: string, updates: any) {
    console.log(`Updating user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...updates, id: userId, updatedAt: new Date().toISOString() };
  }

  @advancedCacheUtils.decorators.rateLimitedCache({
    ttl: 60 * 1000, // 1 minute
    maxCalls: 3, // Max 3 calls per window
    windowMs: 5 * 60 * 1000 // 5 minute window
  })
  async rateLimitedOperation() {
    console.log('Executing rate-limited operation...');
    await new Promise(resolve => setTimeout(resolve, 200));
    return { operation: 'rate-limited', timestamp: Date.now() };
  }

  @advancedCacheUtils.decorators.cacheWithFallback({
    primary: {
      ttl: 2 * 60 * 1000,
      keyGenerator: (...args) => `primary:${args.join(':')}`
    },
    fallback: {
      ttl: 30 * 60 * 1000, // 30 minutes
      keyGenerator: (...args) => `fallback:${args.join(':')}`
    }
  })
  async operationWithFallback(key: string) {
    console.log(`Attempting primary operation for ${key}...`);
    if (Math.random() > 0.7) { // 30% chance of failure
      throw new Error('Primary operation failed');
    }
    return { key, data: 'Primary data', timestamp: Date.now() };
  }
}

const userService = new UserService();

export const AdvancedCacheDemo: React.FC = () => {
  // Service Worker and offline status
  const swStatus = useServiceWorker();
  const offlineStatus = useOfflineStatus();
  const { warmupCache, invalidateCache, clearCache, getCacheStats } = useCacheManager();

  // Cache management state
  const [cacheStats, setCacheStats] = useState<any>({});
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [userId, setUserId] = useState('123');
  const [logs, setLogs] = useState<string[]>([]);

  // Cache hooks for demonstration
  const userCache = useCache(`demo:user:${userId}`, {
    ttl: 3 * 60 * 1000,
    staleWhileRevalidate: true
  });

  const apiCache = useApiCache(`/api/demo/data`, {
    strategy: 'network-first',
    staleWhileRevalidate: true,
    backgroundRefresh: true
  });

  const paginatedCache = usePaginatedCache('demo-pages', {
    pageSize: 5,
    prefetchNextPage: true
  });

  // Add log entry
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // Initialize advanced caching systems
  useEffect(() => {
    initializeCaching();
    addLog('Advanced caching systems initialized');
  }, [addLog]);

  // Update cache stats periodically
  useEffect(() => {
    const updateStats = async () => {
      try {
        const stats = await getCacheStats();
        setCacheStats(stats);
        
        // Get performance report
        const perfReport = await advancedCacheUtils.performance.generateReport();
        setPerformanceReport(perfReport);
        
        // Get alerts
        const perfAlerts = advancedCacheUtils.performance.getAlerts();
        setAlerts(perfAlerts);
      } catch (error) {
        console.warn('Failed to update cache stats:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [getCacheStats]);

  // Track user behavior for predictive caching
  const trackBehavior = useCallback((action: string, page: string) => {
    advancedCacheUtils.warming.trackBehavior({
      sessionId: `demo-session-${Date.now()}`,
      page,
      action,
      duration: Math.random() * 5000
    });
    addLog(`Tracked behavior: ${action} on ${page}`);
  }, [addLog]);

  // Demo functions
  const testBasicCache = async () => {
    addLog('Testing basic cache operations...');
    
    // Test cache set/get
    await cacheUtils.set('demo:test', { message: 'Hello Cache!', timestamp: Date.now() });
    const value = await cacheUtils.get('demo:test');
    addLog(`Cache test result: ${JSON.stringify(value)}`);
    
    // Test has/clear
    const exists = await cacheUtils.has('demo:test');
    addLog(`Cache key exists: ${exists}`);
  };

  const testDecoratorCache = async () => {
    addLog('Testing decorator-based caching...');
    
    try {
      // Test cached method
      const profile1 = await userService.getUserProfile(userId);
      addLog(`First call - Profile: ${JSON.stringify(profile1)}`);
      
      const profile2 = await userService.getUserProfile(userId);
      addLog(`Second call - Should be cached: ${JSON.stringify(profile2)}`);
      
      // Test API caching
      const apiData1 = await userService.fetchUserData('/api/demo/endpoint');
      addLog(`API call 1: ${JSON.stringify(apiData1)}`);
      
      const apiData2 = await userService.fetchUserData('/api/demo/endpoint');
      addLog(`API call 2 - Should be cached: ${JSON.stringify(apiData2)}`);
      
    } catch (error) {
      addLog(`Decorator test error: ${(error as Error).message}`);
    }
  };

  const testErrorHandling = async () => {
    addLog('Testing error handling and fallbacks...');
    
    try {
      // Test operation with fallback
      const result = await userService.operationWithFallback('test-key');
      addLog(`Fallback operation result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`All operations failed: ${(error as Error).message}`);
    }
    
    // Test rate limiting
    try {
      for (let i = 0; i < 5; i++) {
        const result = await userService.rateLimitedOperation();
        addLog(`Rate limited call ${i + 1}: Success`);
      }
    } catch (error) {
      addLog(`Rate limit exceeded: ${(error as Error).message}`);
    }
  };

  const testCacheInvalidation = async () => {
    addLog('Testing cache invalidation...');
    
    try {
      // Set some test data
      await cacheUtils.set('user:123', { name: 'Test User' });
      await cacheUtils.set('user:456', { name: 'Another User' });
      await cacheUtils.set('api:users', { users: [] });
      
      addLog('Test data set in cache');
      
      // Invalidate by pattern
      await invalidateCache('user:*');
      addLog('Invalidated all user cache entries');
      
      // Invalidate by tag
      await cacheUtils.invalidateByTag('user-data');
      addLog('Invalidated cache entries tagged with user-data');
      
      // Clear specific cache
      await clearCache('api-cache');
      addLog('Cleared API cache');
      
    } catch (error) {
      addLog(`Invalidation test error: ${(error as Error).message}`);
    }
  };

  const testPerformanceMonitoring = async () => {
    addLog('Testing performance monitoring...');
    
    // Record some test operations
    advancedCacheUtils.performance.recordOperation('get', 'memory', true, 50);
    advancedCacheUtils.performance.recordOperation('set', 'localStorage', true, 25);
    advancedCacheUtils.performance.recordOperation('get', 'memory', false, 2000);
    
    addLog('Recorded test performance metrics');
    
    // Generate new report
    const report = await advancedCacheUtils.performance.generateReport();
    addLog(`Performance report generated - Hit rate: ${(report.summary.hitRate * 100).toFixed(1)}%`);
  };

  const testCacheWarming = async () => {
    addLog('Testing cache warming...');
    
    try {
      // Force warmup some keys
      await advancedCacheUtils.warming.forceWarmup([
        'demo:user:123',
        'api:users/list',
        'static:config'
      ]);
      
      addLog('Cache warming completed');
      
      // Get warming metrics
      const metrics = advancedCacheUtils.warming.getMetrics();
      addLog(`Warming metrics: ${JSON.stringify(metrics, null, 2)}`);
      
      // Get predictions
      const predictions = advancedCacheUtils.warming.getPredictions();
      addLog(`Active predictions: ${predictions.length}`);
      
    } catch (error) {
      addLog(`Warming test error: ${(error as Error).message}`);
    }
  };

  const testIndexedDB = async () => {
    addLog('Testing IndexedDB cache...');
    
    try {
      if (advancedCacheUtils.indexedDB.isSupported()) {
        const quota = await advancedCacheUtils.indexedDB.getStorageQuota();
        addLog(`Storage quota: ${(quota.usage / 1024 / 1024).toFixed(2)}MB used of ${(quota.quota / 1024 / 1024).toFixed(2)}MB`);
        
        // Test IndexedDB operations
        const db = advancedCacheUtils.indexedDB.create({ dbName: 'DemoCache' });
        await db.initialize();
        await db.set('demo:indexeddb', { test: true, timestamp: Date.now() });
        const value = await db.get('demo:indexeddb');
        addLog(`IndexedDB test: ${JSON.stringify(value)}`);
        
      } else {
        addLog('IndexedDB not supported in this browser');
      }
    } catch (error) {
      addLog(`IndexedDB test error: ${(error as Error).message}`);
    }
  };

  const warmupAppCache = async () => {
    addLog('Warming up application cache...');
    
    try {
      await warmupCache([
        '/api/user/profile',
        '/api/navigation/menu',
        '/static/icons/app-icon.svg',
        '/api/dashboard/metrics'
      ]);
      
      addLog('Application cache warming completed');
    } catch (error) {
      addLog(`Cache warmup error: ${(error as Error).message}`);
    }
  };

  const clearAllCaches = async () => {
    addLog('Clearing all caches...');
    
    try {
      await cacheUtils.clear();
      await clearCache();
      addLog('All caches cleared');
    } catch (error) {
      addLog(`Cache clear error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Advanced Cache System Demo</h1>
        
        {/* Status indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Service Worker</h3>
            <p className={`text-sm ${swStatus.registered ? 'text-green-600' : 'text-red-600'}`}>
              {swStatus.registered ? 'Registered' : 'Not registered'}
            </p>
            {swStatus.updateAvailable && (
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Update Available
              </button>
            )}
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Offline Status</h3>
            <p className={`text-sm ${!offlineStatus.isOffline ? 'text-green-600' : 'text-orange-600'}`}>
              {offlineStatus.isOffline ? 'Offline' : 'Online'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Cache Health</h3>
            <p className="text-sm text-green-600">
              {Object.keys(cacheStats).length} caches active
            </p>
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(cacheStats).map(([name, stats]: [string, any]) => (
            <div key={name} className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-800">{name}</h4>
              <p className="text-sm text-gray-600">
                {stats.entries} entries, {stats.totalSizeMB}MB
              </p>
            </div>
          ))}
        </div>

        {/* Performance Report Summary */}
        {performanceReport && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Hit Rate:</span>
                <span className="ml-2 font-mono">
                  {(performanceReport.summary.hitRate * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Avg Latency:</span>
                <span className="ml-2 font-mono">
                  {performanceReport.summary.averageLatency.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-gray-600">Memory:</span>
                <span className="ml-2 font-mono">
                  {(performanceReport.summary.memoryUsage * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Efficiency:</span>
                <span className="ml-2 font-mono">
                  {(performanceReport.summary.efficiency * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Performance Alerts</h3>
            {alerts.map(alert => (
              <div key={alert.id} className={`text-sm p-2 rounded ${
                alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testBasicCache}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Basic Cache
          </button>
          
          <button
            onClick={testDecoratorCache}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Decorators
          </button>
          
          <button
            onClick={testErrorHandling}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Error Handling
          </button>
          
          <button
            onClick={testCacheInvalidation}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test Invalidation
          </button>
          
          <button
            onClick={testPerformanceMonitoring}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Test Monitoring
          </button>
          
          <button
            onClick={testCacheWarming}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Test Warming
          </button>
          
          <button
            onClick={testIndexedDB}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Test IndexedDB
          </button>
          
          <button
            onClick={warmupAppCache}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            Warmup App Cache
          </button>
          
          <button
            onClick={clearAllCaches}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear All Caches
          </button>
        </div>

        {/* User ID Input */}
        <div className="flex items-center gap-4 mb-6">
          <label className="font-medium">User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={() => trackBehavior('user-id-change', 'demo')}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Track Behavior
          </button>
        </div>

        {/* Live Cache Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">User Cache Example</h3>
            {userCache.loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : userCache.error ? (
              <p className="text-red-500">Error: {userCache.error.message}</p>
            ) : (
              <pre className="text-sm bg-white p-2 rounded">
                {JSON.stringify(userCache.data, null, 2)}
              </pre>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">API Cache Example</h3>
            {apiCache.loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : apiCache.error ? (
              <p className="text-red-500">Error: {apiCache.error.message}</p>
            ) : (
              <pre className="text-sm bg-white p-2 rounded">
                {JSON.stringify(apiCache.data, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-black text-green-400 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Activity Log</h3>
          <div className="font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCacheDemo;