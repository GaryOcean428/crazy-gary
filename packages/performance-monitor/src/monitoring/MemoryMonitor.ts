import { MemoryUsage, PerformanceAlert } from '../types';

export class MemoryMonitor {
  private static intervalId: NodeJS.Timeout | null = null;
  private static callbacks: Array<(usage: MemoryUsage) => void> = [];
  private static isInitialized = false;
  private static baselineMemory: number | null = null;
  private static memoryHistory: MemoryUsage[] = [];
  private static leakThreshold = 10; // MB increase threshold

  static initialize() {
    if (this.isInitialized) return;
    
    // Set baseline memory usage
    this.setBaseline();
    this.isInitialized = true;
  }

  static start(callback: (usage: MemoryUsage) => void) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    this.callbacks.push(callback);
    
    // Start monitoring every 5 seconds
    this.intervalId = setInterval(() => {
      this.collectMemoryUsage();
    }, 5000);
    
    console.log('Memory monitoring started');
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.callbacks = [];
    console.log('Memory monitoring stopped');
  }

  private static setBaseline() {
    if (this.isMemoryAPIAvailable()) {
      const usage = (performance as any).memory;
      this.baselineMemory = usage.usedJSHeapSize;
    }
  }

  private static collectMemoryUsage() {
    if (!this.isMemoryAPIAvailable()) {
      console.warn('Performance.memory API not available');
      return;
    }

    try {
      const usage = (performance as any).memory;
      const memoryData: MemoryUsage = {
        usedJSHeapSize: usage.usedJSHeapSize,
        totalJSHeapSize: usage.totalJSHeapSize,
        jsHeapSizeLimit: usage.jsHeapSizeLimit,
        timestamp: Date.now()
      };

      // Store in history (keep last 100 measurements)
      this.memoryHistory.push(memoryData);
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift();
      }

      // Check for memory leaks
      this.detectMemoryLeak(memoryData);

      // Notify callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(memoryData);
        } catch (error) {
          console.error('Error in memory monitoring callback:', error);
        }
      });

      // Log memory usage in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Memory Usage:', {
          used: `${Math.round(memoryData.usedJSHeapSize / (1024 * 1024))}MB`,
          total: `${Math.round(memoryData.totalJSHeapSize / (1024 * 1024))}MB`,
          limit: `${Math.round(memoryData.jsHeapSizeLimit / (1024 * 1024))}MB`
        });
      }

    } catch (error) {
      console.error('Failed to collect memory usage:', error);
    }
  }

  private static detectMemoryLeak(currentUsage: MemoryUsage) {
    if (this.memoryHistory.length < 10) {
      return; // Need at least 10 measurements to detect patterns
    }

    const recentUsage = this.memoryHistory.slice(-10);
    const averageRecent = recentUsage.reduce((sum, usage) => sum + usage.usedJSHeapSize, 0) / recentUsage.length;
    
    if (this.baselineMemory) {
      const memoryIncrease = (averageRecent - this.baselineMemory) / (1024 * 1024); // MB
      
      if (memoryIncrease > this.leakThreshold) {
        this.createMemoryLeakAlert(memoryIncrease);
      }
    }
  }

  private static createMemoryLeakAlert(memoryIncrease: number) {
    const alert: PerformanceAlert = {
      id: `memory-leak-${Date.now()}`,
      type: 'memory-leak',
      severity: memoryIncrease > 20 ? 'critical' : 'warning',
      message: `Potential memory leak detected: ${memoryIncrease.toFixed(1)}MB increase from baseline`,
      timestamp: Date.now(),
      resolved: false,
      metadata: {
        memoryIncrease,
        baseline: this.baselineMemory ? Math.round(this.baselineMemory / (1024 * 1024)) : null,
        current: Math.round(this.getCurrentMemoryUsage() / (1024 * 1024))
      }
    };

    console.warn('Memory leak detected:', alert);
  }

  private static getCurrentMemoryUsage(): number {
    if (this.memoryHistory.length > 0) {
      return this.memoryHistory[this.memoryHistory.length - 1].usedJSHeapSize;
    }
    return 0;
  }

  private static isMemoryAPIAvailable(): boolean {
    return typeof (performance as any).memory !== 'undefined';
  }

  static getCurrentMemoryStats(): {
    used: number;
    total: number;
    limit: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (!this.isMemoryAPIAvailable() || this.memoryHistory.length === 0) {
      return {
        used: 0,
        total: 0,
        limit: 0,
        percentage: 0,
        trend: 'stable'
      };
    }

    const current = this.memoryHistory[this.memoryHistory.length - 1];
    const usedMB = current.usedJSHeapSize / (1024 * 1024);
    const totalMB = current.totalJSHeapSize / (1024 * 1024);
    const limitMB = current.jsHeapSizeLimit / (1024 * 1024);
    const percentage = (current.usedJSHeapSize / current.jsHeapSizeLimit) * 100;

    // Calculate trend based on last 10 measurements
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (this.memoryHistory.length >= 10) {
      const recent = this.memoryHistory.slice(-10);
      const first = recent[0].usedJSHeapSize;
      const last = recent[recent.length - 1].usedJSHeapSize;
      const change = ((last - first) / first) * 100;

      if (change > 5) {
        trend = 'increasing';
      } else if (change < -5) {
        trend = 'decreasing';
      }
    }

    return {
      used: Math.round(usedMB),
      total: Math.round(totalMB),
      limit: Math.round(limitMB),
      percentage: Math.round(percentage * 100) / 100,
      trend
    };
  }

  static getMemoryHistory(): MemoryUsage[] {
    return [...this.memoryHistory];
  }

  static clearMemoryHistory() {
    this.memoryHistory = [];
    this.setBaseline();
  }

  static setLeakThreshold(thresholdMB: number) {
    this.leakThreshold = thresholdMB;
  }

  static getLeakThreshold(): number {
    return this.leakThreshold;
  }

  static generateMemoryReport(): {
    summary: {
      current: ReturnType<MemoryMonitor['getCurrentMemoryStats']>;
      history: {
        count: number;
        timespan: number; // milliseconds
        peak: number;
        average: number;
      };
      baseline: {
        value: number | null;
        timestamp: number | null;
      };
    };
    trends: {
      shortTerm: 'increasing' | 'decreasing' | 'stable';
      longTerm: 'increasing' | 'decreasing' | 'stable';
    };
    alerts: PerformanceAlert[];
  } {
    const current = this.getCurrentMemoryStats();
    const history = this.memoryHistory;
    
    let peak = 0;
    let sum = 0;
    
    history.forEach(usage => {
      peak = Math.max(peak, usage.usedJSHeapSize);
      sum += usage.usedJSHeapSize;
    });

    const average = history.length > 0 ? sum / history.length : 0;
    const timespan = history.length > 1 
      ? history[history.length - 1].timestamp - history[0].timestamp 
      : 0;

    // Calculate trends
    let shortTerm: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let longTerm: 'increasing' | 'decreasing' | 'stable' = 'stable';

    if (history.length >= 10) {
      const recent = history.slice(-10);
      const older = history.slice(-20, -10);
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, u) => sum + u.usedJSHeapSize, 0) / recent.length;
        const olderAvg = older.reduce((sum, u) => sum + u.usedJSHeapSize, 0) / older.length;
        
        if (recentAvg > olderAvg * 1.05) shortTerm = 'increasing';
        else if (recentAvg < olderAvg * 0.95) shortTerm = 'decreasing';
      }
    }

    if (history.length >= 20) {
      const firstHalf = history.slice(0, Math.floor(history.length / 2));
      const secondHalf = history.slice(Math.floor(history.length / 2));
      
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, u) => sum + u.usedJSHeapSize, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, u) => sum + u.usedJSHeapSize, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.1) longTerm = 'increasing';
        else if (secondAvg < firstAvg * 0.9) longTerm = 'decreasing';
      }
    }

    return {
      summary: {
        current,
        history: {
          count: history.length,
          timespan,
          peak: Math.round(peak / (1024 * 1024)),
          average: Math.round(average / (1024 * 1024))
        },
        baseline: {
          value: this.baselineMemory ? Math.round(this.baselineMemory / (1024 * 1024)) : null,
          timestamp: this.baselineMemory ? Date.now() : null
        }
      },
      trends: {
        shortTerm,
        longTerm
      },
      alerts: [] // This would be populated from AlertManager
    };
  }
}