/**
 * Cache configuration and settings
 */

import { CacheConfig, CacheWarmupConfig, CacheMonitoringConfig } from './cache-types';

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  enableCompression: false,
  enableEncryption: false,
  namespace: 'app'
};

export const CACHE_CONFIGS = {
  // Memory cache configuration
  memory: {
    ...DEFAULT_CACHE_CONFIG,
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 500
  },

  // API response cache configuration
  api: {
    ...DEFAULT_CACHE_CONFIG,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 200,
    enableCompression: true
  },

  // User data cache configuration
  userData: {
    ...DEFAULT_CACHE_CONFIG,
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 100,
    enableEncryption: true,
    namespace: 'user'
  },

  // Static assets cache configuration
  staticAssets: {
    ...DEFAULT_CACHE_CONFIG,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 50,
    namespace: 'static'
  },

  // Component cache configuration
  components: {
    ...DEFAULT_CACHE_CONFIG,
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 300
  },

  // Session cache configuration
  session: {
    ...DEFAULT_CACHE_CONFIG,
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 200,
    namespace: 'session'
  }
} as const;

// Cache warmup configuration
export const CACHE_WARMUP_CONFIG: CacheWarmupConfig = {
  enabled: true,
  strategies: {
    eager: [
      'user-profile',
      'navigation-menu',
      'theme-settings',
      'common-config'
    ],
    lazy: [
      'user-dashboard-data',
      'recent-activity',
      'notifications',
      'quick-actions'
    ],
    background: [
      'analytics-data',
      'metrics',
      'reports',
      'historical-data'
    ],
    predictive: [
      'user-preferences',
      'frequently-accessed-pages',
      'related-content',
      'search-suggestions'
    ]
  },
  intervals: {
    eager: 5 * 60 * 1000, // 5 minutes
    lazy: 10 * 60 * 1000, // 10 minutes
    background: 15 * 60 * 1000, // 15 minutes
    predictive: 30 * 60 * 1000 // 30 minutes
  }
};

// Cache monitoring configuration
export const CACHE_MONITORING_CONFIG: CacheMonitoringConfig = {
  enabled: true,
  samplingRate: 0.1, // 10% sampling
  metrics: {
    latency: true,
    hitRate: true,
    memoryUsage: true,
    errorRate: true,
    custom: {
      cacheEfficiency: true,
      stalenessRate: true,
      evictionRate: true
    }
  },
  alerting: {
    hitRateThreshold: 0.8, // Alert if hit rate drops below 80%
    memoryThreshold: 0.85, // Alert if memory usage exceeds 85%
    latencyThreshold: 100 // Alert if average latency exceeds 100ms
  }
};

// Environment-specific configurations
export const getCacheConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  if (isDevelopment) {
    return {
      ...CACHE_CONFIGS,
      memory: {
        ...CACHE_CONFIGS.memory,
        ttl: 60 * 1000, // 1 minute in dev
        maxSize: 100
      },
      api: {
        ...CACHE_CONFIGS.api,
        ttl: 2 * 60 * 1000, // 2 minutes in dev
        maxSize: 50
      }
    };
  }

  if (isProduction) {
    return {
      ...CACHE_CONFIGS,
      memory: {
        ...CACHE_CONFIGS.memory,
        ttl: 30 * 60 * 1000, // 30 minutes in prod
        maxSize: 1000
      },
      api: {
        ...CACHE_CONFIGS.api,
        ttl: 15 * 60 * 1000, // 15 minutes in prod
        maxSize: 500
      }
    };
  }

  return CACHE_CONFIGS;
};

// Cache key naming conventions
export const CACHE_KEYS = {
  PREFIX: 'crazy-gary',
  
  // User-related keys
  USER: {
    PROFILE: 'user:profile',
    PREFERENCES: 'user:preferences',
    SESSION: 'user:session',
    PERMISSIONS: 'user:permissions'
  },

  // API keys
  API: {
    ENDPOINTS: 'api:endpoints',
    RESPONSE: 'api:response',
    DATA: 'api:data'
  },

  // Component keys
  COMPONENTS: {
    UI_STATE: 'components:ui-state',
    DASHBOARD: 'components:dashboard',
    NAVIGATION: 'components:navigation'
  },

  // Static keys
  STATIC: {
    ASSETS: 'static:assets',
    ICONS: 'static:icons',
    FONTS: 'static:fonts'
  },

  // Utility function to generate namespaced keys
  generate: (namespace: string, key: string, suffix?: string): string => {
    const base = `${CACHE_KEYS.PREFIX}:${namespace}:${key}`;
    return suffix ? `${base}:${suffix}` : base;
  }
} as const;