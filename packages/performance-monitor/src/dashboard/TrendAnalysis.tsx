import React, { useMemo } from 'react';
import { ReportGenerator } from '../metrics/ReportGenerator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const TrendAnalysis: React.FC = () => {
  const reports = useMemo(() => {
    return ReportGenerator.getStoredReports();
  }, []);

  const trendAnalysis = useMemo(() => {
    return ReportGenerator.generateTrendAnalysis(reports);
  }, [reports]);

  const summary = useMemo(() => {
    return ReportGenerator.generateSummary(reports);
  }, [reports]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
        </div>
        <div className="p-6 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No trend data available</p>
          <p className="text-sm text-gray-400 mt-1">
            Generate some performance reports to see trends
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalReports}</p>
            <p className="text-xs text-gray-500 mt-1">
              Over {Math.round(summary.timeRange.duration / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Budget Compliance</p>
            <p className="text-2xl font-bold text-green-600">{summary.budgetCompliance.compliance}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.budgetCompliance.violations} violations
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg LCP</p>
            <p className="text-2xl font-bold text-gray-900">{summary.averages.LCP}ms</p>
            <p className="text-xs text-gray-500 mt-1">
              Target: &lt;2500ms
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Memory</p>
            <p className="text-2xl font-bold text-gray-900">{summary.averages.Memory}MB</p>
            <p className="text-xs text-gray-500 mt-1">
              Peak usage tracked
            </p>
          </div>
        </div>
      </div>

      {/* Web Vitals Trends */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Web Vitals Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(trendAnalysis.webVitals).map(([metric, data]) => (
            <div key={metric} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{metric}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getTrendColor(data.trend)}`}>
                    {data.trend}
                  </span>
                  <span className="text-xs text-gray-500">
                    {data.change > 0 ? '+' : ''}{data.change}%
                  </span>
                </div>
              </div>
              
              {data.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#6b7280"
                      fontSize={10}
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                      tickFormatter={(value) => formatValue(value, metric)}
                    />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value as number)}
                      formatter={(value) => [formatValue(value as number, metric), metric]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No data available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Memory and Bundle Size Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Memory Usage Trend</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded ${getTrendColor(trendAnalysis.memory.trend)}`}>
                {trendAnalysis.memory.trend}
              </span>
              <span className="text-xs text-gray-500">
                {trendAnalysis.memory.change > 0 ? '+' : ''}{trendAnalysis.memory.change}%
              </span>
            </div>
          </div>
          
          {trendAnalysis.memory.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendAnalysis.memory.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => formatDate(value)}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${Math.round(value)}MB`}
                />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as number)}
                  formatter={(value) => [`${Math.round(value as number)}MB`, 'Memory Usage']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No memory data available
            </div>
          )}
        </div>

        {/* Bundle Size Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Bundle Size Trend</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded ${getTrendColor(trendAnalysis.bundleSize.trend)}`}>
                {trendAnalysis.bundleSize.trend}
              </span>
              <span className="text-xs text-gray-500">
                {trendAnalysis.bundleSize.change > 0 ? '+' : ''}{trendAnalysis.bundleSize.change}%
              </span>
            </div>
          </div>
          
          {trendAnalysis.bundleSize.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendAnalysis.bundleSize.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => formatDate(value)}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${Math.round(value)}MB`}
                />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as number)}
                  formatter={(value) => [`${Math.round(value as number)}MB`, 'Bundle Size']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No bundle size data available
            </div>
          )}
        </div>
      </div>

      {/* Trend Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Web Vitals</h4>
            <div className="space-y-2">
              {Object.entries(trendAnalysis.webVitals).map(([metric, data]) => (
                <div key={metric} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{metric}:</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(data.trend)}
                    <span className="text-gray-900 capitalize">{data.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">System Resources</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Memory:</span>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trendAnalysis.memory.trend)}
                  <span className="text-gray-900 capitalize">{trendAnalysis.memory.trend}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Bundle Size:</span>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trendAnalysis.bundleSize.trend)}
                  <span className="text-gray-900 capitalize">{trendAnalysis.bundleSize.trend}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Overall Health</h4>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">
                {summary.budgetCompliance.compliance}%
              </p>
              <p className="text-sm text-green-700">Budget Compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};