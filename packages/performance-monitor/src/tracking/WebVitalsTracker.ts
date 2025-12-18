import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP, Metric } from 'web-vitals';

export class WebVitalsTracker {
  private static isInitialized = false;
  private static callbacks: Array<(metrics: Partial<Metric>) => void> = [];

  static initialize() {
    if (this.isInitialized) return;

    try {
      // Track Largest Contentful Paint (LCP)
      onLCP((metric) => {
        this.handleMetric('LCP', metric);
      });

      // Track First Input Delay (FID)
      onFID((metric) => {
        this.handleMetric('FID', metric);
      });

      // Track Cumulative Layout Shift (CLS)
      onCLS((metric) => {
        this.handleMetric('CLS', metric);
      });

      // Track First Contentful Paint (FCP)
      onFCP((metric) => {
        this.handleMetric('FCP', metric);
      });

      // Track Time to First Byte (TTFB)
      onTTFB((metric) => {
        this.handleMetric('TTFB', metric);
      });

      // Track Interaction to Next Paint (INP)
      onINP((metric) => {
        this.handleMetric('INP', metric);
      });

      this.isInitialized = true;
      console.log('Web Vitals tracking initialized');
    } catch (error) {
      console.error('Failed to initialize Web Vitals tracking:', error);
    }
  }

  static start(callback: (metrics: Partial<Metric>) => void) {
    if (!this.isInitialized) {
      this.initialize();
    }
    this.callbacks.push(callback);
  }

  static stop() {
    this.callbacks = [];
    this.isInitialized = false;
  }

  private static handleMetric(name: string, metric: Metric) {
    // Store metric in session storage for persistence
    this.storeMetric(name, metric);

    // Notify all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback({ [name]: metric.value });
      } catch (error) {
        console.error('Error in Web Vitals callback:', error);
      }
    });

    // Log metric for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital - ${name}:`, {
        value: metric.value,
        rating: this.getRating(name, metric.value),
        delta: metric.delta,
        id: metric.id
      });
    }
  }

  private static storeMetric(name: string, metric: Metric) {
    try {
      const key = `web-vitals-${name}`;
      const existing = sessionStorage.getItem(key);
      const metrics = existing ? JSON.parse(existing) : [];
      
      metrics.push({
        value: metric.value,
        timestamp: Date.now(),
        rating: this.getRating(name, metric.value),
        delta: metric.delta,
        id: metric.id
      });

      // Keep only last 10 measurements
      if (metrics.length > 10) {
        metrics.shift();
      }

      sessionStorage.setItem(key, JSON.stringify(metrics));
    } catch (error) {
      console.warn('Failed to store Web Vitals metric:', error);
    }
  }

  private static getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  static getStoredMetrics(name?: string): any[] {
    try {
      if (name) {
        const key = `web-vitals-${name}`;
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      } else {
        // Return all metrics
        const allMetrics: Record<string, any[]> = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('web-vitals-')) {
            const metricName = key.replace('web-vitals-', '');
            const stored = sessionStorage.getItem(key);
            if (stored) {
              allMetrics[metricName] = JSON.parse(stored);
            }
          }
        }
        return allMetrics;
      }
    } catch (error) {
      console.warn('Failed to retrieve stored Web Vitals metrics:', error);
      return [];
    }
  }

  static clearStoredMetrics() {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('web-vitals-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear stored Web Vitals metrics:', error);
    }
  }

  static getAverageMetrics(): Record<string, number> {
    const allMetrics = this.getStoredMetrics();
    const averages: Record<string, number> = {};

    Object.entries(allMetrics).forEach(([name, metrics]) => {
      if (metrics.length > 0) {
        const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
        averages[name] = Math.round(sum / metrics.length);
      }
    });

    return averages;
  }
}