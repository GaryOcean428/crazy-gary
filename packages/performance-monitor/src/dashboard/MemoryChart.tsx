import React, { useMemo } from 'react';
import { MemoryMonitor } from '../monitoring/MemoryMonitor';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MemoryChart: React.FC = () => {
  const memoryData = useMemo(() => {
    const history = MemoryMonitor.getMemoryHistory();
    
    return history.map(usage => ({
      timestamp: usage.timestamp,
      used: Math.round(usage.usedJSHeapSize / (1024 * 1024)), // MB
      total: Math.round(usage.totalJSHeapSize / (1024 * 1024)), // MB
      limit: Math.round(usage.jsHeapSizeLimit / (1024 * 1024)), // MB
      date: new Date(usage.timestamp).toLocaleTimeString()
    }));
  }, []);

  const memoryStats = useMemo(() => {
    return MemoryMonitor.getCurrentMemoryStats();
  }, []);

  const memoryReport = useMemo(() => {
    return MemoryMonitor.generateMemoryReport();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 bg-red-50';
      case 'decreasing':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getUsageLevel = (percentage: number) => {
    if (percentage < 50) return { level: 'Low', color: 'text-green-600 bg-green-50' };
    if (percentage < 75) return { level: 'Moderate', color: 'text-yellow-600 bg-yellow-50' };
    if (percentage < 90) return { level: 'High', color: 'text-orange-600 bg-orange-50' };
    return { level: 'Critical', color: 'text-red-600 bg-red-50' };
  };

  const usageLevel = getUsageLevel(memoryStats.percentage);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Current Memory Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Used Memory</p>
              <p className="text-2xl font-bold text-gray-900">{memoryStats.used} MB</p>
            </div>
            <div className={`p-2 rounded-full ${getTrendColor(memoryStats.trend)}`}>
              {getTrendIcon(memoryStats.trend)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Allocated</p>
            <p className="text-2xl font-bold text-gray-900">{memoryStats.total} MB</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Memory Limit</p>
            <p className="text-2xl font-bold text-gray-900">{memoryStats.limit} MB</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Usage</p>
            <p className="text-2xl font-bold text-gray-900">{memoryStats.percentage}%</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${usageLevel.color} mt-1`}>
              {usageLevel.level}
            </span>
          </div>
        </div>
      </div>

      {/* Memory Usage Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Memory Usage Over Time</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <span className="text-gray-600">Used</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="text-gray-600">Total</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <span className="text-gray-600">Limit</span>
            </div>
          </div>
        </div>
        
        {memoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value}MB`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}MB
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="limit"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="total"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="used"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No memory data available
          </div>
        )}
      </div>

      {/* Memory Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Trends */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Short-term Trend (last 10 samples)</span>
              <div className="flex items-center space-x-2">
                {getTrendIcon(memoryReport.trends.shortTerm)}
                <span className="text-sm font-medium capitalize">{memoryReport.trends.shortTerm}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Long-term Trend</span>
              <div className="flex items-center space-x-2">
                {getTrendIcon(memoryReport.trends.longTerm)}
                <span className="text-sm font-medium capitalize">{memoryReport.trends.longTerm}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Baseline Memory</span>
              <span className="text-sm font-medium">
                {memoryReport.summary.baseline.value ? `${memoryReport.summary.baseline.value} MB` : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Peak Usage</span>
              <span className="text-sm font-medium">{memoryReport.summary.history.peak} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Usage</span>
              <span className="text-sm font-medium">{memoryReport.summary.history.average} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sample Count</span>
              <span className="text-sm font-medium">{memoryReport.summary.history.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monitoring Duration</span>
              <span className="text-sm font-medium">
                {Math.round(memoryReport.summary.history.timespan / 1000 / 60)} minutes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Leak Detection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Leak Detection</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Leak Threshold</p>
              <p className="text-sm text-gray-600">
                Alerts when memory increases by more than {MemoryMonitor.getLeakThreshold()}MB from baseline
              </p>
            </div>
            <button
              onClick={() => {
                const newThreshold = prompt('Enter new memory leak threshold (MB):', MemoryMonitor.getLeakThreshold().toString());
                if (newThreshold && !isNaN(Number(newThreshold))) {
                  MemoryMonitor.setLeakThreshold(Number(newThreshold));
                }
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Adjust Threshold
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-green-700">Leaks Detected</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{memoryData.length}</p>
              <p className="text-sm text-blue-700">Samples Collected</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {memoryData.length > 0 ? Math.round(memoryData.reduce((sum, d) => sum + d.used, 0) / memoryData.length) : 0}
              </p>
              <p className="text-sm text-purple-700">Avg Usage (MB)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Data Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            MemoryMonitor.clearMemoryHistory();
            window.location.reload();
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Memory History
        </button>
        <button
          onClick={() => MemoryMonitor.clearMemoryHistory()}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};