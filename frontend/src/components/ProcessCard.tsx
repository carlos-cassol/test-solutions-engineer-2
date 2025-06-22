import React from 'react';
import { Process } from '../types/Process';

interface ProcessCardProps {
  process: Process;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ process }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'AT_RISK':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-test-radar-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 truncate">{process.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
          {process.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Tipo:</span>
          <span className="ml-1">{process.type}</span>
        </div>

        {process.vehicleId && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Veículo:</span>
            <span className="ml-1">{process.vehicleId}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Estágio:</span>
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
            <span className="font-medium">Risco:</span>
            <span className={`ml-1 px-2 py-1 rounded text-xs ${
              process.riskScore > 0.7 ? 'bg-red-100 text-red-800' :
              process.riskScore > 0.4 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {Math.round(process.riskScore * 100)}%
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Criado: {new Date(process.createdAt).toLocaleDateString()}</span>
          <span>{process.alerts.length} alertas</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessCard; 