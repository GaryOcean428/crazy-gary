/**
 * Advanced Cache Decorators for Function-Level Caching
 * Provides decorators for caching function results with various strategies
 */

import { cache } from './cache-manager';

// Cache configuration options
export interface CacheDecoratorOptions {
  ttl?: number;
  keyGenerator?: (...args: any[]) => string;
  invalidateOn?: string[];
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxSize?: number;
  tags?: string[];
  conditional?: (...args: any[]) => boolean;
}

/**
 * Memoization decorator for simple function caching
 */
export function cached(options?: CacheDecoratorOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheKeyPrefix = `${target.constructor.name}:${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = options?.keyGenerator 
        ? options.keyGenerator(...args)
        : `${cacheKeyPrefix}:${JSON.stringify(args)}`;

      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = await originalMethod.apply(this, args);
      
      const cacheOptions = {
        ttl: options?.ttl || 5 * 60 * 1000, // 5 minutes default
        tags: options?.tags || [`function:${propertyKey}`],
        maxSize: options?.maxSize
      };

      await cache.set(cacheKey, result, cacheOptions);
      return result;
    };

    return descriptor;
  };
}

/**
 * Cache with invalidation decorator
 */
export function cacheWithInvalidation(options: CacheDecoratorOptions & {
  invalidateOnMethods?: string[];
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheKeyPrefix = `${target.constructor.name}:${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `${cacheKeyPrefix}:${JSON.stringify(args)}`;

      // Conditional caching
      if (options.conditional && !options.conditional(...args)) {
        return await originalMethod.apply(this, args);
      }

      // Try cache first based on strategy
      switch (options.strategy || 'cache-first') {
        case 'cache-first':
          const cached = await cache.get(cacheKey);
          if (cached !== null) {
            return cached;
          }
          break;
          
        case 'network-first':
          try {
            const result = await originalMethod.apply(this, args);
            await cache.set(cacheKey, result, {
              ttl: options.ttl,
              tags: options.tags
            });
            return result;
          } catch (error) {
            const cached = await cache.get(cacheKey);
            if (cached !== null) {
              return cached;
            }
            throw error;
          }
          
        case 'stale-while-revalidate':
          const cached = await cache.get(cacheKey);
          if (cached !== null) {
            // Refresh in background
            originalMethod.apply(this, args).then(result => {
              cache.set(cacheKey, result, {
                ttl: options.ttl,
                tags: options.tags
              });
            }).catch(console.warn);
            return cached;
          }
          break;
      }

      // No cache or strategy requires fresh data
      const result = await originalMethod.apply(this, args);
      await cache.set(cacheKey, result, {
        ttl: options.ttl || 5 * 60 * 1000,
        tags: options.tags || [`function:${propertyKey}`],
        maxSize: options.maxSize
      });
      
      return result;
    };

    // Add invalidation method
    if (options.invalidateOnMethods) {
      target[`invalidate${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)}Cache`] = 
        async (...args: any[]) => {
          const cacheKey = options.keyGenerator 
            ? options.keyGenerator(...args)
            : `${cacheKeyPrefix}:${JSON.stringify(args)}`;
          await cache.delete(cacheKey);
        };
    }

    return descriptor;
  };
}

/**
 * API caching decorator for HTTP requests
 */
export function cacheApi(options: {
  ttl?: number;
  keyGenerator?: (url: string, method?: string) => string;
  invalidateOnStatusCodes?: number[];
  conditional?: (response: Response) => boolean;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (url: string, ...args: any[]) {
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(url, args[0]?.method)
        : `api:${url}:${args[0]?.method || 'GET'}`;

      // Only cache GET requests by default
      if (!args[0] || args[0].method !== 'GET') {
        return await originalMethod.apply(this, [url, ...args]);
      }

      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const response = await originalMethod.apply(this, [url, ...args]);
      
      // Check if response should be cached
      if (options.conditional && !options.conditional(response)) {
        return response;
      }

      // Don't cache error responses unless specified
      if (response.ok || !options.invalidateOnStatusCodes?.includes(response.status)) {
        const responseData = await response.clone().json();
        await cache.set(cacheKey, responseData, {
          ttl: options.ttl || 5 * 60 * 1000,
          tags: [`api:${url}`, 'api-cache']
        });
      }

      return response;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator that invalidates related cache entries
 */
export function invalidateCacheOn(options: {
  invalidatePatterns: string[];
  invalidateTags?: string[];
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Execute the method
        const result = await originalMethod.apply(this, args);

        // Invalidate cache in parallel
        await Promise.all([
          ...options.invalidatePatterns.map(pattern => 
            cache.invalidatePattern(pattern)
          ),
          ...(options.invalidateTags || []).map(tag => 
            cache.invalidateByTag(tag)
          )
        ]);

        return result;
      } catch (error) {
        // Still invalidate cache even if method fails (assuming failure is due to data change)
        await Promise.all([
          ...options.invalidatePatterns.map(pattern => 
            cache.invalidatePattern(pattern)
          ),
          ...(options.invalidateTags || []).map(tag => 
            cache.invalidateByTag(tag)
          )
        ]);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Rate-limited cache decorator to prevent excessive calls
 */
export function rateLimitedCache(options: {
  ttl: number;
  maxCalls: number;
  windowMs: number;
  keyGenerator?: (...args: any[]) => string;
}) {
  const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheKeyPrefix = `rate-limited:${target.constructor.name}:${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `${cacheKeyPrefix}:${JSON.stringify(args)}`;

      const now = Date.now();
      const rateLimit = rateLimitCache.get(cacheKey);

      if (rateLimit && now < rateLimit.resetTime) {
        if (rateLimit.count >= options.maxCalls) {
          // Try to get from cache
          const cached = await cache.get(cacheKey);
          if (cached !== null) {
            return cached;
          }
          throw new Error(`Rate limit exceeded for ${propertyKey}`);
        }
        rateLimit.count++;
      } else {
        rateLimitCache.set(cacheKey, {
          count: 1,
          resetTime: now + options.windowMs
        });
      }

      try {
        const result = await originalMethod.apply(this, args);
        
        // Cache successful result
        await cache.set(cacheKey, result, {
          ttl: options.ttl
        });
        
        return result;
      } catch (error) {
        // Try cache on error
        const cached = await cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache with fallback decorator
 */
export function cacheWithFallback(options: {
  primary: CacheDecoratorOptions;
  fallback: CacheDecoratorOptions;
  fallbackCondition?: (error: any) => boolean;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Try primary cache strategy
        const cacheKey = options.primary.keyGenerator 
          ? options.primary.keyGenerator(...args)
          : `primary:${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

        const cached = await cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);
        await cache.set(cacheKey, result, {
          ttl: options.primary.ttl || 5 * 60 * 1000,
          tags: options.primary.tags
        });

        return result;
      } catch (error) {
        // Check if we should use fallback
        if (options.fallbackCondition && !options.fallbackCondition(error)) {
          throw error;
        }

        // Try fallback cache
        const fallbackKey = options.fallback.keyGenerator 
          ? options.fallback.keyGenerator(...args)
          : `fallback:${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

        const fallbackCached = await cache.get(fallbackKey);
        if (fallbackCached !== null) {
          return fallbackCached;
        }

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache statistics decorator that tracks usage
 */
export function cacheWithStats(options: {
  trackMetrics?: boolean;
  logSlowCalls?: boolean;
  slowCallThreshold?: number;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const startTime = Date.now();

    descriptor.value = async function (...args: any[]) {
      const methodStart = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - methodStart;

        if (options.trackMetrics) {
          // Record metrics
          const cacheKey = `stats:${target.constructor.name}:${propertyKey}`;
          const stats = await cache.get(cacheKey) || { calls: 0, totalTime: 0, slowCalls: 0 };
          
          stats.calls++;
          stats.totalTime += duration;
          if (options.logSlowCalls && duration > (options.slowCallThreshold || 1000)) {
            stats.slowCalls++;
          }

          await cache.set(cacheKey, stats, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
        }

        return result;
      } catch (error) {
        const duration = Date.now() - methodStart;
        
        if (options.trackMetrics) {
          const cacheKey = `stats:${target.constructor.name}:${propertyKey}`;
          const stats = await cache.get(cacheKey) || { calls: 0, totalTime: 0, errors: 0 };
          
          stats.calls++;
          stats.errors = (stats.errors || 0) + 1;
          stats.totalTime += duration;

          await cache.set(cacheKey, stats, { ttl: 24 * 60 * 60 * 1000 });
        }

        throw error;
      }
    };

    return descriptor;
  };
}

// Utility function to clear function cache
export async function clearFunctionCache(className?: string, methodName?: string) {
  if (className && methodName) {
    await cache.invalidatePattern(`*:${className}:${methodName}:*`);
  } else if (className) {
    await cache.invalidatePattern(`*:${className}:*`);
  } else {
    await cache.invalidatePattern(`*function:*`);
  }
}

// Utility to get function cache statistics
export async function getFunctionCacheStats(className?: string, methodName?: string) {
  const pattern = className && methodName 
    ? `stats:${className}:${methodName}`
    : className 
    ? `stats:${className}:*`
    : `stats:*`;

  // This would need to be implemented to iterate through cache entries
  // For now, return a placeholder
  return {
    totalFunctions: 0,
    totalCalls: 0,
    averageCallTime: 0,
    slowCalls: 0,
    errorRate: 0
  };
}