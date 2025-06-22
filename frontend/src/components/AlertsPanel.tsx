import React from 'react';
import { Process } from '../types/Process';

interface AlertsPanelProps {
  processes: Process[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ processes }) => {
  const allAlerts = processes.flatMap(process => 
    process.alerts.map(alert => ({
      ...alert,
      processTitle: process.title,
      processId: process.id
    }))
  );

  const criticalAlerts = allAlerts.filter(alert => alert.alertLevel >= 3);
  const recentAlerts = allAlerts.slice(0, 5);

  if (allAlerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
        <p className="text-gray-600 text-center py-4">Nenhum alerta ativo</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Alertas Recentes</h3>
          {criticalAlerts.length > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {criticalAlerts.length} críticos
            </span>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {recentAlerts.map((alert) => (
          <div key={alert.id} className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    alert.alertLevel >= 4 ? 'bg-red-500' :
                    alert.alertLevel >= 3 ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></span>
                  <span className="text-sm font-medium text-gray-900">
                    {alert.processTitle}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.alertLevel >= 4 ? 'bg-red-100 text-red-800' :
                    alert.alertLevel >= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    Nível {alert.alertLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{alert.alertMessage}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel; 