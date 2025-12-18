/**
 * Performance Monitor Integration Example
 * 
 * This file demonstrates how to integrate the performance monitoring system
 * into the Crazy Gary web application.
 */

import React, { useEffect, useState } from 'react';
import { 
  PerformanceMonitor, 
  PerformanceDashboard,
  usePerformanceMonitoring,
  defaultConfig
} from '@crazy-gary/performance-monitor';

// Custom performance configuration for Crazy Gary
const crazyGaryConfig = {
  ...defaultConfig,
  budgets: [
    // Web Vitals budgets
    { name: 'LCP', value: 2500, unit: 'ms', type: 'largest-contentful-paint', threshold: 'good' },
    { name: 'FID', value: 100, unit: 'ms', type: 'first-input-delay', threshold: 'good' },
    { name: 'CLS', value: 0.1, unit: 'ms', type: 'cumulative-layout-shift', threshold: 'good' },
    { name: 'FCP', value: 1800, unit: 'ms', type: 'first-contentful-paint', threshold: 'good' },
    { name: 'TTFB', value: 800, unit: 'ms', type: 'network', threshold: 'good' },
    
    // Resource budgets specific to Crazy Gary
    { name: 'Bundle Size', value: 800, unit: 'KB', type: 'bundle-size', threshold: 'good' },
    { name: 'Memory Usage', value: 75, unit: 'MB', type: 'memory', threshold: 'good' },
    { name: 'API Response Time', value: 500, unit: 'ms', type: 'network', threshold: 'good' }
  ],
  
  // Adjusted sampling for production
  sampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0, // 5% in prod, 100% in dev
  
  // More frequent reporting for better monitoring
  reportInterval: process.env.NODE_ENV === 'production' ? 60000 : 30000,
  
  // Strict alert thresholds for a production app
  alertThresholds: {
    memoryLeak: 15,          // 15MB increase
    bundleSizeIncrease: 10,  // 10% increase
    performanceRegression: 15 // 15% regression
  }
};

// Performance Monitor Provider Component
export const PerformanceMonitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    try {
      PerformanceMonitor.initialize(crazyGaryConfig);
      
      if (process.env.NODE_ENV === 'development') {
        // Start monitoring immediately in development
        PerformanceMonitor.start();
        console.log('🚀 Performance monitoring initialized for development');
      } else {
        // In production, start after a delay to not impact initial load
        const timer = setTimeout(() => {
          PerformanceMonitor.start();
          console.log('🚀 Performance monitoring started for production');
        }, 5000);

        return () => clearTimeout(timer);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize performance monitoring:', error);
    }
  }, []);

  return (
    <>
      {children}
      
      {/* Development-only performance dashboard */}
      {process.env.NODE_ENV === 'development' && isInitialized && (
        <PerformanceDashboard />
      )}
    </>
  );
};

// Performance Widget for showing key metrics in the app
export const PerformanceWidget: React.FC = () => {
  const performance = usePerformanceMonitoring();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development or if explicitly enabled
  if (!performance || (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_SHOW_PERFORMANCE_WIDGET)) {
    return null;
  }

  const activeAlerts = performance.alerts.filter(alert => !alert.resolved);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`mb-2 p-3 rounded-full shadow-lg transition-all ${
          criticalAlerts.length > 0 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : warningAlerts.length > 0
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {criticalAlerts.length + warningAlerts.length}
          </span>
        )}
      </button>

      {/* Performance status panel */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Performance Status</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status indicators */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monitoring</span>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${performance.isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  {performance.isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Alerts summary */}
            {activeAlerts.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Active Alerts</div>
                
                {criticalAlerts.map(alert => (
                  <div key={alert.id} className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-800">Critical</span>
                      <span className="text-red-600">{alert.type.replace('-', ' ')}</span>
                    </div>
                    <p className="text-red-700 mt-1">{alert.message}</p>
                  </div>
                ))}
                
                {warningAlerts.map(alert => (
                  <div key={alert.id} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-yellow-800">Warning</span>
                      <span className="text-yellow-600">{alert.type.replace('-', ' ')}</span>
                    </div>
                    <p className="text-yellow-700 mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Current metrics */}
            {performance.currentReport && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Current Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(performance.currentReport.webVitals).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">
                          {key === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t">
              <button
                onClick={() => performance.generateReport()}
                className="w-full text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                Generate Report
              </button>
              
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    // Import DevTools dynamically to avoid bundling in production
                    import('@crazy-gary/performance-monitor').then(({ DevTools }) => {
                      DevTools.clearAllData();
                      console.log('Performance data cleared');
                    });
                  }}
                  className="w-full text-xs bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                >
                  Clear Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Performance-focused route wrapper
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function PerformanceTrackedComponent(props: P) {
    useEffect(() => {
      // Track route change performance
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const routeTime = endTime - startTime;
        
        // Log slow route transitions in development
        if (process.env.NODE_ENV === 'development' && routeTime > 100) {
          console.warn(`Slow route transition detected: ${routeTime.toFixed(2)}ms`);
        }
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
};

// Custom hook for performance monitoring in components
export const useComponentPerformance = (componentName: string) => {
  const performance = usePerformanceMonitoring();
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) { // 16ms = 60fps
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Event - ${componentName}: ${eventName}`, metadata);
    }
  };

  return { trackEvent };
};

// Error boundary with performance tracking
export class PerformanceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log performance-related errors
    if (error.message.includes('performance') || error.message.includes('memory')) {
      console.error('Performance-related error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-medium">Performance Error</h2>
          <p className="text-red-700 text-sm mt-1">
            A performance monitoring error occurred. Please refresh the page.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="text-red-600 text-xs mt-2 overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
};

// Export performance testing utilities
export { 
  PerformanceTestRunner,
  createTestCase,
  defaultThresholds 
} from '@crazy-gary/performance-monitor';

// Example performance test for Crazy Gary
export const createCrazyGaryTest = () => {
  return createTestCase(
    'Crazy Gary App Performance',
    window.location.origin,
    [
      { action: 'navigate', target: window.location.origin },
      { action: 'wait', duration: 2000 },
      { action: 'click', target: 'nav a:first-child' },
      { action: 'wait', duration: 1000 },
      { action: 'scroll', duration: 500 },
      { action: 'wait', duration: 1000 }
    ],
    {
      LCP: { max: 2500, warn: 2000 },
      FID: { max: 100, warn: 80 },
      CLS: { max: 0.1, warn: 0.05 },
      FCP: { max: 1800, warn: 1400 },
      TTFB: { max: 800, warn: 600 },
      memory: { max: 75, warn: 50 },
      bundleSize: { max: 800, warn: 600 }
    }
  );
};