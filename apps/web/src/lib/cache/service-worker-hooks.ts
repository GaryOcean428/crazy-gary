/**
 * React hooks for service worker caching
 */

import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  updateAvailable: boolean;
  offlineReady: boolean;
}

interface CacheStatus {
  totalEntries: number;
  totalSize: string;
  caches: Record<string, { entries: number; size: string }>;
}

interface OfflineStatus {
  isOffline: boolean;
  wasOffline: boolean;
  connectionType?: string;
}

export function useServiceWorker(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    supported: 'serviceWorker' in navigator,
    registered: false,
    active: false,
    updateAvailable: false,
    offlineReady: false
  });

  useEffect(() => {
    if (!status.supported) return;

    let isRegistered = false;
    let updateAvailable = false;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered:', registration);

        isRegistered = true;

        // Check if service worker is active
        if (registration.active) {
          setStatus(prev => ({ ...prev, registered: true, active: true }));
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                updateAvailable = true;
                setStatus(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        // Listen for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, data } = event.data;
          
          switch (type) {
            case 'SW_ACTIVATED':
              setStatus(prev => ({ ...prev, active: true, offlineReady: true }));
              break;
              
            case 'CACHE_WARMUP_COMPLETE':
              console.log('Cache warmup completed:', data);
              break;
              
            case 'CACHE_INVALIDATED':
              console.log('Cache invalidated:', data);
              break;
          }
        });

        // Check if we're offline
        if (!navigator.onLine) {
          setStatus(prev => ({ ...prev, offlineReady: true }));
        }

        // Listen for online/offline events
        const handleOnline = () => {
          console.log('Back online');
          // Notify service worker
          if (registration.active) {
            registration.active.postMessage({ type: 'ONLINE' });
          }
        };

        const handleOffline = () => {
          console.log('Gone offline');
          setStatus(prev => ({ ...prev, offlineReady: true }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setStatus(prev => ({ ...prev, registered: false, active: false }));
      }
    };

    const cleanup = registerServiceWorker();

    return () => {
      cleanup?.then(fn => fn && fn());
    };
  }, []);

  return status;
}

export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>({
    isOffline: !navigator.onLine,
    wasOffline: false
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(prev => ({
        isOffline: !navigator.onLine,
        wasOffline: prev.wasOffline || !navigator.onLine
      }));
    };

    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setStatus(prev => ({
          ...prev,
          connectionType: connection?.effectiveType || 'unknown'
        }));
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateConnectionInfo();

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateConnectionInfo);
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  return status;
}

export function useCacheManager() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback((type: string, payload?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker?.controller) {
        reject(new Error('Service Worker not active'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data?.type === `${type}_RESPONSE`) {
          resolve(event.data.data);
        } else if (event.data?.type === `${type}_ERROR`) {
          reject(new Error(event.data.error));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type, payload },
        [messageChannel.port2]
      );
    });
  }, []);

  const warmupCache = useCallback(async (urls: string[]): Promise<void> => {
    setLoading(true);
    try {
      await sendMessage('CACHE_WARMUP', { urls });
    } finally {
      setLoading(false);
    }
  }, [sendMessage]);

  const invalidateCache = useCallback(async (pattern: string): Promise<number> => {
    setLoading(true);
    try {
      const result = await sendMessage('CACHE_INVALIDATE', { pattern });
      return result.invalidatedCount || 0;
    } finally {
      setLoading(false);
    }
  }, [sendMessage]);

  const clearCache = useCallback(async (cacheName?: string): Promise<void> => {
    setLoading(true);
    try {
      await sendMessage('CACHE_CLEAR', { cacheName });
      setCacheStatus(null); // Reset cache status
    } finally {
      setLoading(false);
    }
  }, [sendMessage]);

  const getCacheStats = useCallback(async (): Promise<CacheStatus> => {
    try {
      const stats = await sendMessage('CACHE_STATS');
      setCacheStatus(stats);
      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: '0 B',
        caches: {}
      };
    }
  }, [sendMessage]);

  const getOfflineFallback = useCallback(async (url: string): Promise<Response | null> => {
    try {
      const fallback = await sendMessage('OFFLINE_FALLBACK', { url });
      return fallback;
    } catch (error) {
      console.error('Failed to get offline fallback:', error);
      return null;
    }
  }, [sendMessage]);

  // Auto-refresh cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      getCacheStats();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [getCacheStats]);

  return {
    cacheStatus,
    loading,
    warmupCache,
    invalidateCache,
    clearCache,
    getCacheStats,
    getOfflineFallback
  };
}

export function useProgressiveWebApp() {
  const swStatus = useServiceWorker();
  const offlineStatus = useOfflineStatus();
  const cacheManager = useCacheManager();

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if app is installable
    const checkInstallable = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstallPromptAvailable = installPrompt !== null;
      
      setIsInstallable(!isStandalone && !isInWebAppiOS && isInstallPromptAvailable);
    };

    checkInstallable();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installPrompt]);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      
      setInstallPrompt(null);
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  }, [installPrompt]);

  const updateApp = useCallback(async (): Promise<void> => {
    if (swStatus.updateAvailable) {
      // Send update message to service worker
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }, [swStatus.updateAvailable]);

  const handleNetworkChange = useCallback(() => {
    if (offlineStatus.isOffline) {
      console.log('App is offline');
    } else {
      console.log('App is back online');
    }
  }, [offlineStatus.isOffline]);

  useEffect(() => {
    handleNetworkChange();
  }, [handleNetworkChange]);

  return {
    // Service Worker status
    swStatus,
    
    // Offline status
    offlineStatus,
    
    // Cache management
    cacheManager,
    
    // PWA features
    isInstallable,
    installApp,
    updateApp,
    
    // Convenience getters
    isOnline: !offlineStatus.isOffline,
    isOfflineReady: swStatus.offlineReady,
    hasUpdate: swStatus.updateAvailable
  };
}

// Hook for managing background sync
export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);
  const [syncTags, setSyncTags] = useState<string[]>([]);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype);
  }, []);

  const registerSync = useCallback(async (tag: string, data?: any): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      
      // Store data for later retrieval
      if (data) {
        localStorage.setItem(`bg-sync-${tag}`, JSON.stringify(data));
      }
      
      setSyncTags(prev => [...prev.filter(t => t !== tag), tag]);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }, [isSupported]);

  const unregisterSync = useCallback(async (tag: string): Promise<void> => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const syncRegistration = await registration.sync.getTags();
      
      if (syncRegistration.has(tag)) {
        // Note: There's no direct way to unregister a sync tag
        // It will be automatically removed after execution
        setSyncTags(prev => prev.filter(t => t !== tag));
      }
    } catch (error) {
      console.error('Background sync unregistration failed:', error);
    }
  }, [isSupported]);

  const getSyncData = useCallback((tag: string): any => {
    try {
      const data = localStorage.getItem(`bg-sync-${tag}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const clearSyncData = useCallback((tag: string): void => {
    localStorage.removeItem(`bg-sync-${tag}`);
  }, []);

  return {
    isSupported,
    syncTags,
    registerSync,
    unregisterSync,
    getSyncData,
    clearSyncData
  };
}