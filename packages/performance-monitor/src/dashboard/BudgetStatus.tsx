import React, { useMemo } from 'react';
import { BudgetEnforcer } from '../metrics/BudgetEnforcer';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

export const BudgetStatus: React.FC = () => {
  const budgetReport = useMemo(() => {
    return BudgetEnforcer.generateBudgetReport();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-700" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'critical':
        return 'bg-red-700';
      default:
        return 'bg-gray-400';
    }
  };

  const healthyBudgets = budgetReport.budgets.filter(b => b.status === 'good').length;
  const warningBudgets = budgetReport.budgets.filter(b => b.status === 'warning').length;
  const violatedBudgets = budgetReport.budgets.filter(b => b.status === 'error' || b.status === 'critical').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Performance Budgets</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="text-gray-600">{healthyBudgets} Healthy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
              <span className="text-gray-600">{warningBudgets} Warning</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <span className="text-gray-600">{violatedBudgets} Violated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{healthyBudgets}</p>
            <p className="text-sm text-green-700">Within Budget</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{warningBudgets}</p>
            <p className="text-sm text-yellow-700">Near Limit</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{violatedBudgets}</p>
            <p className="text-sm text-red-700">Exceeded Budget</p>
          </div>
        </div>

        {/* Budget Details */}
        <div className="space-y-4">
          {budgetReport.budgets.map((budget) => (
            <div key={budget.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(budget.status)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{budget.name}</h4>
                    <p className="text-xs text-gray-500">
                      {budget.currentValue !== null ? 'Active' : 'No data'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(budget.status)}`}>
                    {budget.status}
                  </span>
                </div>
              </div>

              {budget.currentValue !== null ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {budget.currentValue}{budget.unit}
                    </span>
                    <span className="text-gray-900">
                      {budget.percentage}% of {budget.budget}{budget.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(budget.status)}`}
                      style={{
                        width: `${Math.min(budget.percentage, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No performance data available for this metric
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Budget Compliance Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Overall Compliance</h4>
              <p className="text-xs text-gray-600 mt-1">
                {healthyBudgets} of {budgetReport.budgets.length} budgets within acceptable limits
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {Math.round((healthyBudgets / budgetReport.budgets.length) * 100)}%
              </p>
              <p className="text-xs text-gray-600">Compliance Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};