/**
 * Cache invalidation patterns and strategies
 */

import { cacheManager } from './cache-manager';
import { CacheInvalidationRule, CacheDependency } from './cache-types';

interface InvalidationEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

interface DependencyGraph {
  [key: string]: string[];
}

interface InvalidationRuleGroup {
  rules: CacheInvalidationRule[];
  enabled: boolean;
  priority: number;
}

export class CacheInvalidationManager {
  private rules: Map<string, InvalidationRuleGroup> = new Map();
  private dependencyGraph: DependencyGraph = {};
  private dependencies: Map<string, CacheDependency> = new Map();
  private eventHistory: InvalidationEvent[] = [];
  private maxEventHistory = 100;

  constructor() {
    this.registerDefaultRules();
    this.setupEventListeners();
  }

  private registerDefaultRules(): void {
    // User-related invalidation rules
    this.registerRuleGroup('user', {
      enabled: true,
      priority: 1,
      rules: [
        {
          pattern: 'user:profile:*',
          action: 'clear',
          tags: ['user-profile']
        },
        {
          pattern: 'user:permissions:*',
          action: 'dependency',
          dependencies: ['user:profile:*'],
          conditions: (entry) => entry.value?.role !== entry.value?.oldRole
        },
        {
          pattern: 'api:/api/user/*',
          action: 'invalidate',
          dependencies: ['user:*'],
          tags: ['user-data']
        }
      ]
    });

    // API-related invalidation rules
    this.registerRuleGroup('api', {
      enabled: true,
      priority: 2,
      rules: [
        {
          pattern: 'api:response:*',
          action: 'tag',
          tags: ['api-response']
        },
        {
          pattern: 'api:endpoints:*',
          action: 'dependency',
          dependencies: ['api:response:*']
        }
      ]
    });

    // Component-related invalidation rules
    this.registerRuleGroup('components', {
      enabled: true,
      priority: 3,
      rules: [
        {
          pattern: 'components:dashboard:*',
          action: 'dependency',
          dependencies: ['api:/api/dashboard/*', 'user:preferences:*']
        },
        {
          pattern: 'components:navigation:*',
          action: 'dependency',
          dependencies: ['user:permissions:*']
        }
      ]
    });

    // Session-related invalidation rules
    this.registerRuleGroup('session', {
      enabled: true,
      priority: 4,
      rules: [
        {
          pattern: 'session:*',
          action: 'clear',
          tags: ['session-data']
        }
      ]
    });
  }

  registerRuleGroup(name: string, group: InvalidationRuleGroup): void {
    this.rules.set(name, group);
  }

  registerRule(name: string, rule: CacheInvalidationRule, groupName?: string): void {
    if (groupName) {
      const group = this.rules.get(groupName);
      if (group) {
        group.rules.push(rule);
        this.rules.set(groupName, group);
      }
    } else {
      this.registerRuleGroup(name, {
        enabled: true,
        priority: 999,
        rules: [rule]
      });
    }
  }

  private setupEventListeners(): void {
    // Listen for storage events (for cross-tab invalidation)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith('cache-invalidation:')) {
          const eventData = JSON.parse(event.newValue || '{}');
          this.handleInvalidationEvent({
            type: eventData.type,
            payload: eventData.payload,
            timestamp: Date.now()
          });
        }
      });
    }
  }

  async invalidate(keyOrPattern: string, options?: {
    groupName?: string;
    propagate?: boolean;
    reason?: string;
  }): Promise<number> {
    const { groupName, propagate = true, reason = 'manual' } = options || {};
    
    let invalidatedCount = 0;
    const timestamp = Date.now();

    // Create invalidation event
    const event: InvalidationEvent = {
      type: 'manual-invalidation',
      payload: { keyOrPattern, reason, groupName },
      timestamp
    };

    try {
      if (groupName) {
        const group = this.rules.get(groupName);
        if (group?.enabled) {
          invalidatedCount += await this.applyRules(group.rules, keyOrPattern, propagate);
        }
      } else {
        // Apply all enabled rules
        const sortedGroups = Array.from(this.rules.entries())
          .filter(([, group]) => group.enabled)
          .sort(([, a], [, b]) => a.priority - b.priority);

        for (const [, group] of sortedGroups) {
          invalidatedCount += await this.applyRules(group.rules, keyOrPattern, propagate);
        }
      }

      // Broadcast invalidation event to other tabs
      this.broadcastInvalidationEvent(event);

      return invalidatedCount;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  private async applyRules(rules: CacheInvalidationRule[], keyOrPattern: string, propagate: boolean): Promise<number> {
    let count = 0;

    for (const rule of rules) {
      try {
        // Check if the key/pattern matches this rule
        if (this.matchesPattern(keyOrPattern, rule.pattern)) {
          const entry = await this.getCacheEntry(keyOrPattern);
          
          // Check conditions if provided
          if (rule.conditions && entry && !rule.conditions(entry)) {
            continue;
          }

          // Apply the invalidation action
          switch (rule.action) {
            case 'clear':
              count += await this.clearEntry(keyOrPattern);
              break;
              
            case 'invalidate':
              count += await this.invalidateEntry(keyOrPattern);
              break;
              
            case 'tag':
              await this.tagEntry(keyOrPattern, rule.tags || []);
              break;
              
            case 'dependency':
              if (propagate && rule.dependencies) {
                for (const dependency of rule.dependencies) {
                  count += await this.invalidate(dependency, { propagate: true, reason: 'dependency' });
                }
              }
              break;
          }
        }
      } catch (error) {
        console.warn(`Rule application failed for ${rule.pattern}:`, error);
      }
    }

    return count;
  }

  private matchesPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
    return regex.test(key);
  }

  private async getCacheEntry(key: string): Promise<any> {
    try {
      return await cacheManager.get(key);
    } catch {
      return null;
    }
  }

  private async clearEntry(key: string): Promise<number> {
    try {
      await cacheManager.delete(key);
      return 1;
    } catch {
      return 0;
    }
  }

  private async invalidateEntry(key: string): Promise<number> {
    // Mark as invalid but don't delete (for future cleanup)
    try {
      const value = await cacheManager.get(key);
      if (value && typeof value === 'object') {
        // Add invalidation metadata
        const invalidatedValue = {
          ...value,
          _invalidated: true,
          _invalidatedAt: Date.now()
        };
        await cacheManager.set(key, invalidatedValue);
        return 1;
      }
    } catch {
      // Fallback to deletion
    }
    
    return await this.clearEntry(key);
  }

  private async tagEntry(key: string, tags: string[]): Promise<void> {
    try {
      const value = await cacheManager.get(key);
      if (value && typeof value === 'object') {
        const taggedValue = {
          ...value,
          _tags: [...(value._tags || []), ...tags]
        };
        await cacheManager.set(key, taggedValue);
      }
    } catch {
      // Ignore tagging errors
    }
  }

  private broadcastInvalidationEvent(event: InvalidationEvent): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `cache-invalidation:${event.timestamp}`,
          JSON.stringify(event)
        );
      }
    } catch (error) {
      console.warn('Failed to broadcast invalidation event:', error);
    }
  }

  private async handleInvalidationEvent(event: InvalidationEvent): Promise<void> {
    this.eventHistory.push(event);
    
    // Keep only recent events
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxEventHistory);
    }

    // Apply event-based invalidation rules
    await this.applyEventBasedRules(event);
  }

  private async applyEventBasedRules(event: InvalidationEvent): Promise<void> {
    // Handle specific event types
    switch (event.type) {
      case 'user-logout':
        await this.invalidatePattern('user:*', 'User logout');
        await this.invalidatePattern('session:*', 'User logout');
        break;
        
      case 'user-role-change':
        await this.invalidatePattern('user:permissions:*', 'Role change');
        await this.invalidatePattern('components:*', 'Role change');
        break;
        
      case 'api-data-updated':
        if (event.payload?.endpoint) {
          await this.invalidatePattern(`api:${event.payload.endpoint}*`, 'API data updated');
        }
        break;
        
      case 'theme-change':
        await this.invalidatePattern('components:ui-state:*', 'Theme change');
        await this.invalidatePattern('static:assets:*', 'Theme change');
        break;
    }
  }

  // Dependency management
  registerDependency(key: string, dependencies: string[], ttl: number, invalidationCallback?: (invalidatedKeys: string[]) => void): void {
    this.dependencies.set(key, {
      key,
      dependencies,
      ttl,
      invalidationCallback
    });
  }

  async invalidatePattern(pattern: string, reason?: string): Promise<number> {
    return this.invalidate(pattern, { reason });
  }

  async invalidateByTag(tag: string, backendName?: string): Promise<number> {
    const results = await cacheManager.getByTag(tag, backendName);
    let count = 0;
    
    for (const key of Object.keys(results)) {
      await cacheManager.delete(key, backendName);
      count++;
    }
    
    return count;
  }

  async clearAll(backendName?: string): Promise<void> {
    await cacheManager.clear(backendName);
    
    // Clear dependency graph
    this.dependencyGraph = {};
    this.dependencies.clear();
    
    // Record event
    this.handleInvalidationEvent({
      type: 'cache-clear-all',
      timestamp: Date.now()
    });
  }

  // Analysis and monitoring
  async analyzeInvalidationHistory(): Promise<{
    totalEvents: number;
    eventTypes: Record<string, number>;
    mostInvalidatedPatterns: Array<{ pattern: string; count: number }>;
    dependencyGraph: DependencyGraph;
  }> {
    const eventTypes: Record<string, number> = {};
    const patternCounts: Map<string, number> = new Map();

    for (const event of this.eventHistory) {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
      
      if (event.payload?.keyOrPattern) {
        const pattern = event.payload.keyOrPattern;
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      }
    }

    const mostInvalidatedPatterns = Array.from(patternCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([pattern, count]) => ({ pattern, count }));

    return {
      totalEvents: this.eventHistory.length,
      eventTypes,
      mostInvalidatedPatterns,
      dependencyGraph: this.dependencyGraph
    };
  }

  async getInvalidationStats(): Promise<{
    totalInvalidations: number;
    averageInvalidationTime: number;
    topInvalidatedKeys: Array<{ key: string; count: number }>;
    dependencyStats: {
      totalDependencies: number;
      averageDependenciesPerKey: number;
      circularDependencies: string[][];
    };
  }> {
    // This would require more sophisticated tracking in a real implementation
    return {
      totalInvalidations: this.eventHistory.length,
      averageInvalidationTime: 0, // Would need timing data
      topInvalidatedKeys: [], // Would need to track individual key invalidations
      dependencyStats: {
        totalDependencies: this.dependencies.size,
        averageDependenciesPerKey: 0, // Would need to calculate
        circularDependencies: [] // Would need to detect cycles
      }
    };
  }

  // Smart invalidation based on usage patterns
  async smartInvalidate(key: string, usageStats?: {
    lastAccessed: number;
    accessFrequency: number;
    dataFreshness: number;
  }): Promise<number> {
    // Analyze usage patterns to determine invalidation strategy
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    const frequencyThreshold = 10; // accesses per hour
    
    let invalidations = 0;

    // If data is stale, invalidate
    if (usageStats && (now - usageStats.lastAccessed > staleThreshold)) {
      invalidations += await this.invalidatePattern(key, 'stale-data');
    }

    // If access frequency is low, consider invalidation
    if (usageStats && usageStats.accessFrequency < frequencyThreshold) {
      invalidations += await this.invalidatePattern(key, 'low-usage');
    }

    // If data is very old, force invalidation
    if (usageStats && (now - usageStats.lastAccessed > staleThreshold * 2)) {
      invalidations += await this.invalidatePattern(key, 'very-stale');
    }

    return invalidations;
  }

  // Export/import invalidation rules
  exportRules(): string {
    const rulesData = Array.from(this.rules.entries()).map(([name, group]) => ({
      name,
      enabled: group.enabled,
      priority: group.priority,
      rules: group.rules
    }));

    return JSON.stringify({
      rules: rulesData,
      dependencies: Array.from(this.dependencies.entries()),
      timestamp: Date.now()
    }, null, 2);
  }

  importRules(rulesJson: string): boolean {
    try {
      const data = JSON.parse(rulesJson);
      
      // Clear existing rules
      this.rules.clear();
      this.dependencies.clear();
      
      // Import rules
      if (data.rules) {
        for (const ruleData of data.rules) {
          this.registerRuleGroup(ruleData.name, {
            enabled: ruleData.enabled,
            priority: ruleData.priority,
            rules: ruleData.rules
          });
        }
      }

      // Import dependencies
      if (data.dependencies) {
        for (const [key, dep] of data.dependencies) {
          this.dependencies.set(key, dep);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import invalidation rules:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cacheInvalidationManager = new CacheInvalidationManager();

// Convenience functions
export const invalidateCache = {
  pattern: (pattern: string, reason?: string) => 
    cacheInvalidationManager.invalidatePattern(pattern, reason),
  
  byTag: (tag: string, backendName?: string) => 
    cacheInvalidationManager.invalidateByTag(tag, backendName),
  
  key: (key: string, options?: { groupName?: string; propagate?: boolean; reason?: string }) => 
    cacheInvalidationManager.invalidate(key, options),
  
  all: (backendName?: string) => 
    cacheInvalidationManager.clearAll(backendName),
  
  smart: (key: string, usageStats?: any) => 
    cacheInvalidationManager.smartInvalidate(key, usageStats)
};

// Event emitters for cache invalidation
export const emitInvalidationEvent = (type: string, payload?: any): void => {
  cacheInvalidationManager['handleInvalidationEvent']({
    type,
    payload,
    timestamp: Date.now()
  });
};