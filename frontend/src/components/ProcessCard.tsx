import React from 'react';
import { Process } from '../types/Process';
import TrafficLightIndicator from './TrafficLightIndicator';

interface ProcessCardProps {
  process: Process;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ process }) => {
  const getStageColor = (stage: string) => {
    const stageColors = {
      R: 'bg-blue-500',
      I: 'bg-purple-500',
      D: 'bg-yellow-500',
      E: 'bg-green-500',
      C: 'bg-gray-500'
    };
    return stageColors[stage as keyof typeof stageColors] || 'bg-gray-500';
  };

  const getLatestAIInsight = () => {
    if (process.aiInsights.length === 0) return null;
    
    const latest = process.aiInsights[process.aiInsights.length - 1];
    const message = latest.message;
    
    if (message.includes('{') && message.includes('}')) {
      try {
        const jsonMatches = message.match(/\{[^}]+\}/g);
        if (jsonMatches && jsonMatches.length > 0) {
          const firstInsight = JSON.parse(jsonMatches[0]);
          return {
            type: firstInsight.type || latest.type,
            message: firstInsight.message || message.substring(0, 100) + '...',
            confidence: firstInsight.confidence || latest.confidence
          };
        }
      } catch {
        // falta criar objeto aqui caso de ruim
      }
    }
    
    return {
      type: latest.type,
      message: message.length > 100 ? message.substring(0, 100) + '...' : message,
      confidence: latest.confidence
    };
  };

  const latestInsight = getLatestAIInsight();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-test-radar-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 truncate">{process.title}</h3>
        <TrafficLightIndicator status={process.status} size="sm" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Type:</span>
          <span className="ml-1">{process.type}</span>
        </div>

        {process.vehicleId && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Vehicle:</span>
            <span className="ml-1">{process.vehicleId}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Stage:</span>
          <div className="flex items-center ml-2">
            {['R', 'I', 'D', 'E', 'C'].map((stage) => (
              <div
                key={stage}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  stage === process.currentStage
                    ? getStageColor(stage)
                    : 'bg-gray-300'
                }`}
              >
                {stage}
              </div>
            ))}
          </div>
        </div>

        {process.riskScore && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Risk:</span>
            <span className={`ml-1 px-2 py-1 rounded text-xs ${
              process.riskScore > 0.7 ? 'bg-red-100 text-red-800' :
              process.riskScore > 0.4 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {Math.round(process.riskScore * 100)}%
            </span>
          </div>
        )}

        {latestInsight && (
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                latestInsight.type === 'PREDICTION' ? 'bg-blue-100 text-blue-800' :
                latestInsight.type === 'ANOMALY' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {latestInsight.type}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(latestInsight.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {latestInsight.message}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Created: {new Date(process.createdAt).toLocaleDateString()}</span>
          <span>{process.alerts.length} alerts</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessCard; 