/**
 * React hooks for caching
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cacheManager } from './cache-manager';
import { apiCache } from './api-cache';
import { CacheOptions, CacheStats } from './cache-types';

interface UseCacheOptions<T = any> extends CacheOptions {
  enabled?: boolean;
  initialData?: T;
  staleWhileRevalidate?: boolean;
  backgroundRefresh?: boolean;
}

interface CacheState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  hitRate: number;
}

// Hook for simple key-value caching
export function useCache<T = any>(key: string, options: UseCacheOptions<T> = {}) {
  const {
    ttl,
    maxSize,
    enabled = true,
    initialData = null,
    staleWhileRevalidate = false,
    backgroundRefresh = true,
    backend
  } = options;

  const [state, setState] = useState<CacheState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: null,
    hitRate: 0
  });

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: !forceRefresh, error: null }));

    try {
      let data: T | null;
      
      if (forceRefresh) {
        data = null;
      } else {
        data = await cacheManager.get<T>(key, backend);
      }

      if (data === null) {
        setState(prev => ({
          ...prev,
          loading: true,
          data: initialData
        }));
        throw new Error('Data not found in cache');
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        lastUpdated: new Date()
      }));

      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
      throw error;
    }
  }, [key, enabled, initialData, backend]);

  const setData = useCallback(async (value: T, cacheOptions?: CacheOptions) => {
    await cacheManager.set(key, value, { ...options, ...cacheOptions });
    setState(prev => ({
      ...prev,
      data: value,
      lastUpdated: new Date()
    }));
  }, [key, options]);

  const refresh = useCallback(async () => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await cacheManager.delete(key, backend);
    setState(prev => ({
      ...prev,
      data: initialData,
      lastUpdated: null
    }));
  }, [key, backend, initialData]);

  // Load initial data
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    hitRate: state.hitRate,
    set: setData,
    refresh,
    invalidate
  };
}

// Hook for API data caching with retry logic
export function useApiCache<T = any>(url: string, options: UseCacheOptions<T> & {
  config?: any;
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'cache-only' | 'network-only';
} = {}) {
  const {
    config = {},
    strategy = 'network-first',
    staleWhileRevalidate = true,
    backgroundRefresh = true,
    ...cacheOptions
  } = options;

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    hitRate: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!url) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({ ...prev, loading: !forceRefresh, error: null }));

      let data: T;

      if (forceRefresh) {
        const response = await apiCache.execute({
          url,
          method: 'GET',
          ...config,
          signal: abortControllerRef.current.signal
        });
        data = response.data;
      } else {
        // Try to get from cache first based on strategy
        const cached = await cacheManager.get<T>(url);
        
        if (cached && strategy !== 'network-only') {
          setState(prev => ({
            ...prev,
            data: cached,
            loading: false,
            lastUpdated: new Date()
          }));

          // Background refresh if enabled
          if (staleWhileRevalidate || backgroundRefresh) {
            setTimeout(() => {
              fetchData(true);
            }, 1000);
          }

          return cached;
        }

        // Cache miss or strategy requires network
        const response = await apiCache.execute({
          url,
          method: 'GET',
          ...config,
          signal: abortControllerRef.current.signal
        });
        data = response.data;
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        lastUpdated: new Date()
      }));

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));

      throw error;
    }
  }, [url, config, strategy, staleWhileRevalidate, backgroundRefresh]);

  const setData = useCallback(async (data: T) => {
    await cacheManager.set(url, data, cacheOptions);
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date()
    }));
  }, [url, cacheOptions]);

  const refresh = useCallback(async () => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await cacheManager.delete(url);
    setState(prev => ({
      ...prev,
      data: null,
      lastUpdated: null
    }));
  }, [url]);

  // Load initial data
  useEffect(() => {
    if (url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, fetchData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    hitRate: state.hitRate,
    set: setData,
    refresh,
    invalidate
  };
}

// Hook for paginated data caching
export function usePaginatedCache<T = any>(
  baseKey: string,
  options: UseCacheOptions<T[]> & {
    pageSize?: number;
    prefetchNextPage?: boolean;
  } = {}
) {
  const { pageSize = 20, prefetchNextPage = true, ...cacheOptions } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<Map<number, CacheState<T[]>>>(new Map());

  const getPageKey = useCallback((page: number) => `${baseKey}:page:${page}`, [baseKey]);

  const loadPage = useCallback(async (page: number, forceRefresh = false) => {
    const pageKey = getPageKey(page);
    
    if (!forceRefresh) {
      const cached = await cacheManager.get<T[]>(pageKey);
      if (cached) {
        setPages(prev => new Map(prev).set(page, {
          data: cached,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          hitRate: 0
        }));
        return cached;
      }
    }

    // Simulate API call - in real implementation, this would call your API
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // This would be your actual API call
    // const response = await apiCache.execute({
    //   url: `${baseKey}?page=${page}&pageSize=${pageSize}`,
    //   method: 'GET'
    // });
    // const data = response.data;

    // For demo purposes, generate mock data
    const data = Array.from({ length: pageSize }, (_, i) => ({
      id: startIndex + i,
      name: `Item ${startIndex + i}`,
      value: Math.random()
    }));

    await cacheManager.set(pageKey, data, cacheOptions);
    
    setPages(prev => new Map(prev).set(page, {
      data,
      loading: false,
      error: null,
      lastUpdated: new Date(),
      hitRate: 0
    }));

    // Prefetch next page
    if (prefetchNextPage && page === currentPage) {
      setTimeout(() => {
        loadPage(page + 1);
      }, 100);
    }

    return data;
  }, [baseKey, pageSize, currentPage, prefetchNextPage, cacheOptions, getPageKey]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    loadPage(page);
  }, [loadPage]);

  const nextPage = useCallback(() => {
    const next = currentPage + 1;
    goToPage(next);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    const prev = Math.max(1, currentPage - 1);
    goToPage(prev);
  }, [currentPage, goToPage]);

  const refresh = useCallback(async () => {
    return loadPage(currentPage, true);
  }, [currentPage, loadPage]);

  const invalidate = useCallback(async () => {
    await cacheManager.invalidatePattern(`${baseKey}:page:*`);
    setPages(new Map());
  }, [baseKey]);

  const currentPageData = pages.get(currentPage);

  // Load initial page
  useEffect(() => {
    if (currentPage > 0) {
      loadPage(currentPage);
    }
  }, [currentPage, loadPage]);

  return {
    data: currentPageData?.data || [],
    loading: currentPageData?.loading || false,
    error: currentPageData?.error || null,
    currentPage,
    totalPages: Math.max(...Array.from(pages.keys()), 1),
    hasNextPage: currentPage < (Math.max(...Array.from(pages.keys()), 1) + 1),
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    invalidate
  };
}

// Hook for real-time data with caching
export function useRealtimeCache<T = any>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseCacheOptions<T> & {
    refreshInterval?: number;
    realtimeEnabled?: boolean;
  } = {}
) {
  const {
    refreshInterval = 30000, // 30 seconds
    realtimeEnabled = true,
    ...cacheOptions
  } = options;

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    hitRate: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: !forceRefresh, error: null }));

      const data = await fetchFn();
      
      await cacheManager.set(key, data, cacheOptions);
      
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        hitRate: 0
      });

      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
      throw error;
    }
  }, [key, fetchFn, cacheOptions]);

  const refresh = useCallback(async () => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await cacheManager.delete(key);
    setState(prev => ({
      ...prev,
      data: null,
      lastUpdated: null
    }));
  }, [key]);

  // Setup refresh interval
  useEffect(() => {
    if (realtimeEnabled && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realtimeEnabled, refreshInterval, fetchData]);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    hitRate: state.hitRate,
    refresh,
    invalidate
  };
}

// Hook for cache statistics and monitoring
export function useCacheStats(backend?: string) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const statsData = await cacheManager.stats(backend);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    } finally {
      setLoading(false);
    }
  }, [backend]);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    refresh
  };
}

// Hook for cache invalidation patterns
export function useCacheInvalidation() {
  const invalidatePattern = useCallback(async (pattern: string, backendName?: string) => {
    return cacheManager.invalidatePattern(pattern, backendName);
  }, []);

  const invalidateByTag = useCallback(async (tag: string, backendName?: string) => {
    return cacheManager.invalidateByTag(tag, backendName);
  }, []);

  const clearCache = useCallback(async (backendName?: string) => {
    return cacheManager.clear(backendName);
  }, []);

  return {
    invalidatePattern,
    invalidateByTag,
    clearCache
  };
}