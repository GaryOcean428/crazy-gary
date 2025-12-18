import React, { useMemo } from 'react';
import { BundleAnalyzer } from '../tracking/BundleAnalyzer';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';

export const BundleAnalysis: React.FC = () => {
  const bundleReport = useMemo(() => {
    return BundleAnalyzer.generateBundleReport();
  }, []);

  const bundleBreakdown = useMemo(() => {
    return BundleAnalyzer.getBundleSizeBreakdown();
  }, []);

  const codeSplitting = bundleReport.codeSplitting;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (successRate: number) => {
    if (successRate >= 90) return 'text-green-600 bg-green-50';
    if (successRate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Bundle Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bundle Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatSize(bundleBreakdown.total)}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Gzipped Size</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatSize(bundleBreakdown.gzipped)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {bundleBreakdown.total > 0 ? Math.round((bundleBreakdown.gzipped / bundleBreakdown.total) * 100) : 0}% of original
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Chunks Loaded</p>
            <p className="text-2xl font-bold text-gray-900">
              {codeSplitting.chunksLoaded}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {codeSplitting.totalChunks} total chunks
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Lazy Load Success</p>
            <p className="text-2xl font-bold text-gray-900">
              {bundleReport.performance.lazyLoadSuccessRate}%
            </p>
            <p className={`text-xs mt-1 px-2 py-1 rounded ${getPerformanceColor(bundleReport.performance.lazyLoadSuccessRate)}`}>
              {codeSplitting.lazyImports.length} lazy imports
            </p>
          </div>
        </div>
      </div>

      {/* Bundle Size Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chunk Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bundle Chunk Breakdown</h3>
          {bundleBreakdown.chunks.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bundleBreakdown.chunks}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="size"
                >
                  {bundleBreakdown.chunks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatSize(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No chunk data available
            </div>
          )}
        </div>

        {/* Dependency Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Dependencies</h3>
          {bundleBreakdown.dependencies.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bundleBreakdown.dependencies.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => formatSize(value)}
                />
                <Tooltip formatter={(value) => formatSize(value as number)} />
                <Bar dataKey="size" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No dependency data available
            </div>
          )}
        </div>
      </div>

      {/* Code Splitting Details */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Code Splitting Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(bundleReport.performance.averageChunkLoadTime)}ms
            </p>
            <p className="text-sm text-blue-700">Avg Chunk Load Time</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {bundleReport.performance.failedChunks}
            </p>
            <p className="text-sm text-red-700">Failed Chunks</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {codeSplitting.lazyImports.filter(imp => imp.loaded).length}
            </p>
            <p className="text-sm text-green-700">Successful Lazy Loads</p>
          </div>
        </div>

        {/* Lazy Import Details */}
        {codeSplitting.lazyImports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Load Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {codeSplitting.lazyImports.map((import_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {import_.path.split('/').pop()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(import_.loadTime)}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatSize(import_.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        import_.loaded 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {import_.loaded ? 'Loaded' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {bundleReport.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Recommendations</h3>
          <div className="space-y-4">
            {bundleReport.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-800">{rec.title}</h4>
                  <p className="text-sm text-yellow-700 mt-1">{rec.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-yellow-600">
                      Impact: {rec.impact}
                    </span>
                    <span className="text-xs text-yellow-600">
                      Effort: {rec.effort}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Analysis Button */}
      <div className="flex justify-end">
        <button
          onClick={() => BundleAnalyzer.clearAnalysis()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Analysis
        </button>
      </div>
    </div>
  );
};