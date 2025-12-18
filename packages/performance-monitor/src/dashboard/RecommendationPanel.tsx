import React, { useMemo } from 'react';
import { AlertManager } from '../monitoring/AlertManager';
import { Lightbulb, Target, Clock, Wrench } from 'lucide-react';

export const RecommendationPanel: React.FC = () => {
  const recommendations = useMemo(() => {
    return AlertManager.getAlertRecommendations();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Target className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <Wrench className="w-4 h-4 text-green-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-600" />;
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
        </div>
        <div className="p-6 text-center">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recommendations at this time</p>
          <p className="text-sm text-gray-400 mt-1">
            Your performance metrics look good!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Performance Recommendations</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getPriorityIcon(rec.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{rec.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">{rec.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium opacity-75">Suggested actions:</p>
                    <ul className="text-xs space-y-1 opacity-75">
                      {rec.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};