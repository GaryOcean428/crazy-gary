import React, { useState, useEffect } from 'react';
import { usePerformanceStore } from '../core/PerformanceEngine';
import { WebVitalsChart } from './WebVitalsChart';
import { MemoryChart } from './MemoryChart';
import { BundleAnalysis } from './BundleAnalysis';
import { AlertsPanel } from './AlertsPanel';
import { BudgetStatus } from './BudgetStatus';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RecommendationPanel } from './RecommendationPanel';
import { TrendAnalysis } from './TrendAnalysis';
import { AlertTriangle, Activity, Memory, Package, TrendingUp, Settings } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'web-vitals' | 'memory' | 'bundles' | 'alerts' | 'trends'>('overview');
  const { 
    currentReport, 
    alerts, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring,
    generateReport,
    config 
  } = usePerformanceStore();

  useEffect(() => {
    // Auto-generate report every 30 seconds
    const interval = setInterval(() => {
      generateReport();
    }, 30000);

    return () => clearInterval(interval);
  }, [generateReport]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'web-vitals', label: 'Web Vitals', icon: TrendingUp },
    { id: 'memory', label: 'Memory', icon: Memory },
    { id: 'bundles', label: 'Bundles', icon: Package },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'trends', label: 'Trends', icon: TrendingUp }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <PerformanceMetrics />
              <BudgetStatus />
            </div>
            <div className="space-y-6">
              <AlertsPanel />
              <RecommendationPanel />
            </div>
          </div>
        );
      case 'web-vitals':
        return <WebVitalsChart />;
      case 'memory':
        return <MemoryChart />;
      case 'bundles':
        return <BundleAnalysis />;
      case 'alerts':
        return <AlertsPanel detailed />;
      case 'trends':
        return <TrendAnalysis />;
      default:
        return null;
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length;
  const errorAlerts = alerts.filter(alert => alert.severity === 'error' && !alert.resolved).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Monitor and optimize your application's performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </span>
              </div>
              
              {/* Alert indicators */}
              {(criticalAlerts > 0 || errorAlerts > 0) && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {criticalAlerts + errorAlerts} alerts
                  </span>
                </div>
              )}

              {/* Control buttons */}
              <div className="flex items-center space-x-2">
                {!isMonitoring ? (
                  <button
                    onClick={startMonitoring}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Start Monitoring
                  </button>
                ) : (
                  <button
                    onClick={stopMonitoring}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Stop Monitoring
                  </button>
                )}
                <button
                  onClick={() => generateReport()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>

        {/* Settings Panel (Collapsible) */}
        <div className="mt-6">
          <details className="bg-white rounded-lg shadow-sm border">
            <summary className="p-4 cursor-pointer flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <Settings className="w-4 h-4" />
              <span>Performance Monitoring Settings</span>
            </summary>
            <div className="p-6 border-t border-gray-200">
              <PerformanceSettings />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const PerformanceSettings: React.FC = () => {
  const { config, updateConfig } = usePerformanceStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monitoring Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sample Rate (0-1)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={config.sampleRate}
              onChange={(e) => updateConfig({ sampleRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Interval (ms)
            </label>
            <input
              type="number"
              value={config.reportInterval}
              onChange={(e) => updateConfig({ reportInterval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Feature Toggles</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.enableMemoryMonitoring}
              onChange={(e) => updateConfig({ enableMemoryMonitoring: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Memory Monitoring</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.enableBundleAnalysis}
              onChange={(e) => updateConfig({ enableBundleAnalysis: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Bundle Analysis</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.enableCodeSplittingMonitoring}
              onChange={(e) => updateConfig({ enableCodeSplittingMonitoring: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Code Splitting Monitoring</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.autoReport}
              onChange={(e) => updateConfig({ autoReport: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Auto Reporting</span>
          </label>
        </div>
      </div>
    </div>
  );
};