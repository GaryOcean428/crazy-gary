import React, { useMemo } from 'react';
import { WebVitalsTracker } from '../tracking/WebVitalsTracker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const WebVitalsChart: React.FC = () => {
  const webVitalsData = useMemo(() => {
    const metrics = WebVitalsTracker.getStoredMetrics();
    
    return Object.entries(metrics).map(([name, values]) => {
      const latestValue = values[values.length - 1];
      const average = values.length > 0 
        ? values.reduce((sum: number, val: any) => sum + val.value, 0) / values.length
        : 0;
      
      return {
        name,
        current: latestValue?.value || 0,
        average: Math.round(average),
        rating: latestValue?.rating || 'unknown',
        timestamp: latestValue?.timestamp || Date.now(),
        data: values.map((val: any, index: number) => ({
          index,
          value: val.value,
          timestamp: val.timestamp
        }))
      };
    });
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return '#10B981'; // green
      case 'needs-improvement': return '#F59E0B'; // yellow
      case 'poor': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getRatingBadge = (rating: string) => {
    const colors = {
      good: 'bg-green-100 text-green-800',
      'needs-improvement': 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };

    return colors[rating as keyof typeof colors] || colors.unknown;
  };

  const formatValue = (value: number, name: string) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getThreshold = (name: string) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 }
    };

    return thresholds[name] || { good: 0, poor: 0 };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Value: {formatValue(payload[0].value, label)}
          </p>
          <p className="text-sm text-gray-600">
            Rating: <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingBadge(data.rating)}`}>
              {data.rating}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {webVitalsData.map((metric) => {
          const threshold = getThreshold(metric.name);
          const percentageOfGood = Math.min((threshold.good / metric.average) * 100, 100);
          
          return (
            <div key={metric.name} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingBadge(metric.rating)}`}>
                  {metric.rating}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.current, metric.name)}
                  </span>
                  <span className="text-sm text-gray-500">Current</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  Average: {formatValue(metric.average, metric.name)}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentageOfGood}%`,
                      backgroundColor: getRatingColor(metric.rating)
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Good: {formatValue(threshold.good, metric.name)}</span>
                  <span>Poor: {formatValue(threshold.poor, metric.name)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {webVitalsData.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {metric.name} History
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingBadge(metric.rating)}`}>
                {metric.rating}
              </span>
            </div>
            
            {metric.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metric.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="index" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => formatValue(value, metric.name)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getRatingColor(metric.rating)}
                    strokeWidth={2}
                    dot={{ fill: getRatingColor(metric.rating), strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: getRatingColor(metric.rating), strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No data available
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Web Vitals Summary Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Web Vitals Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Good Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poor Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {webVitalsData.map((metric) => {
                const threshold = getThreshold(metric.name);
                const isGood = metric.average <= threshold.good;
                const isPoor = metric.average > threshold.poor;
                
                return (
                  <tr key={metric.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatValue(metric.current, metric.name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatValue(metric.average, metric.name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingBadge(metric.rating)}`}>
                        {metric.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatValue(threshold.good, metric.name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatValue(threshold.poor, metric.name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          isGood ? 'bg-green-500' : isPoor ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-sm text-gray-900">
                          {isGood ? 'Good' : isPoor ? 'Poor' : 'Needs Improvement'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Data Button */}
      <div className="flex justify-end">
        <button
          onClick={() => WebVitalsTracker.clearStoredMetrics()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Web Vitals Data
        </button>
      </div>
    </div>
  );
};