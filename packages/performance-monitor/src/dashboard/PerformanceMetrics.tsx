import React, { useMemo } from 'react';
import { usePerformanceStore } from '../core/PerformanceEngine';
import { PerformanceMetric } from '../types';
import { Activity, Clock, Globe, Smartphone, Monitor } from 'lucide-react';

export const PerformanceMetrics: React.FC = () => {
  const { currentReport } = usePerformanceStore();

  const metrics = useMemo(() => {
    if (!currentReport) return [];

    const webVitals = [
      { name: 'LCP', value: currentReport.webVitals.LCP, unit: 'ms', icon: Clock },
      { name: 'FID', value: currentReport.webVitals.FID, unit: 'ms', icon: Activity },
      { name: 'CLS', value: currentReport.webVitals.CLS, unit: '', icon: Monitor },
      { name: 'FCP', value: currentReport.webVitals.FCP, unit: 'ms', icon: Clock },
      { name: 'TTFB', value: currentReport.webVitals.TTFB, unit: 'ms', icon: Globe }
    ].filter(metric => metric.value !== undefined);

    return webVitals;
  }, [currentReport]);

  const systemInfo = useMemo(() => {
    if (!currentReport) return null;

    return {
      url: currentReport.url,
      userAgent: currentReport.userAgent,
      timestamp: new Date(currentReport.timestamp).toLocaleString(),
      reportId: currentReport.id
    };
  }, [currentReport]);

  const getRatingColor = (metric: string, value: number | undefined) => {
    if (!value) return 'text-gray-500';
    
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-500';

    if (metric === 'CLS') {
      if (value <= threshold.good) return 'text-green-600';
      if (value <= threshold.poor) return 'text-yellow-600';
      return 'text-red-600';
    }

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatValue = (value: number | undefined, unit: string) => {
    if (!value) return 'N/A';
    if (unit === '') return value.toFixed(3);
    return `${Math.round(value)}${unit}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Current Performance Metrics</h3>
      </div>

      <div className="p-6">
        {currentReport ? (
          <div className="space-y-6">
            {/* Web Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      <span className={getRatingColor(metric.name, metric.value)}>
                        {formatValue(metric.value, metric.unit)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {metric.name === 'LCP' && 'Largest Contentful Paint'}
                      {metric.name === 'FID' && 'First Input Delay'}
                      {metric.name === 'CLS' && 'Cumulative Layout Shift'}
                      {metric.name === 'FCP' && 'First Contentful Paint'}
                      {metric.name === 'TTFB' && 'Time to First Byte'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* System Information */}
            {systemInfo && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Session Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">URL:</span>
                    <p className="font-mono text-xs text-gray-900 mt-1 break-all">
                      {systemInfo.url}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Report ID:</span>
                    <p className="font-mono text-xs text-gray-900 mt-1">
                      {systemInfo.reportId}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Generated:</span>
                    <p className="text-gray-900 mt-1">{systemInfo.timestamp}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">User Agent:</span>
                    <p className="font-mono text-xs text-gray-900 mt-1 break-all">
                      {systemInfo.userAgent.length > 50 
                        ? systemInfo.userAgent.substring(0, 50) + '...'
                        : systemInfo.userAgent
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Memory Usage Summary */}
            {currentReport.memoryUsage.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Memory Usage</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const latest = currentReport.memoryUsage[currentReport.memoryUsage.length - 1];
                    const usedMB = Math.round(latest.usedJSHeapSize / (1024 * 1024));
                    const totalMB = Math.round(latest.totalJSHeapSize / (1024 * 1024));
                    const limitMB = Math.round(latest.jsHeapSizeLimit / (1024 * 1024));
                    const percentage = Math.round((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100);

                    return (
                      <>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{usedMB}MB</p>
                          <p className="text-xs text-gray-600">Used</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{totalMB}MB</p>
                          <p className="text-xs text-gray-600">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{percentage}%</p>
                          <p className="text-xs text-gray-600">Usage</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Bundle Analysis Summary */}
            {currentReport.bundleAnalysis && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Bundle Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Size:</span>
                    <p className="font-bold text-gray-900 mt-1">
                      {Math.round(currentReport.bundleAnalysis.size / 1024)}KB
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Gzipped:</span>
                    <p className="font-bold text-gray-900 mt-1">
                      {Math.round(currentReport.bundleAnalysis.gzippedSize / 1024)}KB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No performance data available</p>
            <p className="text-sm text-gray-400 mt-1">
              Start monitoring to see performance metrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};