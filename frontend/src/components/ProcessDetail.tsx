import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Process } from '../types/Process';

const ProcessDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProcess(id);
    }
  }, [id]);

  const fetchProcess = async (processId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/processes/${processId}`);
      if (response.ok) {
        const data = await response.json();
        setProcess(data);
      }
    } catch (error) {
      console.error('Error fetching process:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-test-radar-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando processo...</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Processo não encontrado</p>
        <Link to="/" className="text-test-radar-600 hover:underline mt-2 inline-block">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-test-radar-600 hover:underline mb-2 inline-block">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{process.title}</h1>
          <p className="text-gray-600 mt-2">Detalhes do processo RIDEC</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            process.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            process.status === 'AT_RISK' ? 'bg-yellow-100 text-yellow-800' :
            process.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {process.status}
          </span>
        </div>
      </div>

      {/* RIDEC Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline RIDEC</h2>
        <div className="flex items-center space-x-4">
          {['R', 'I', 'D', 'E', 'C'].map((stage, index) => {
            const stageData = process.stages.find(s => s.stageKey === stage);
            const isActive = process.currentStage === stage;
            const isCompleted = stageData?.endTime;
            
            return (
              <div key={stage} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  isActive ? 'bg-test-radar-600' :
                  isCompleted ? 'bg-green-500' :
                  'bg-gray-300'
                }`}>
                  {stage}
                </div>
                {index < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Processo</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Tipo:</span>
              <span className="ml-2 text-gray-900">{process.type}</span>
            </div>
            {process.vehicleId && (
              <div>
                <span className="font-medium text-gray-700">Veículo:</span>
                <span className="ml-2 text-gray-900">{process.vehicleId}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Estágio Atual:</span>
              <span className="ml-2 text-gray-900">{process.currentStage}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Criado em:</span>
              <span className="ml-2 text-gray-900">
                {new Date(process.createdAt).toLocaleString()}
              </span>
            </div>
            {process.predictedCompletionTime && (
              <div>
                <span className="font-medium text-gray-700">Previsão de Conclusão:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(process.predictedCompletionTime).toLocaleString()}
                </span>
              </div>
            )}
            {process.riskScore && (
              <div>
                <span className="font-medium text-gray-700">Score de Risco:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  process.riskScore > 0.7 ? 'bg-red-100 text-red-800' :
                  process.riskScore > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {Math.round(process.riskScore * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights de IA</h3>
          {process.aiInsights.length > 0 ? (
            <div className="space-y-3">
              {process.aiInsights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="border-l-4 border-test-radar-500 pl-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      insight.type === 'PREDICTION' ? 'bg-blue-100 text-blue-800' :
                      insight.type === 'ANOMALY' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {insight.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}% confiança
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhum insight de IA disponível</p>
          )}
        </div>
      </div>

      {/* Alerts */}
      {process.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
          <div className="space-y-3">
            {process.alerts.map((alert) => (
              <div key={alert.id} className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.alertLevel >= 4 ? 'bg-red-100 text-red-800' :
                    alert.alertLevel >= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    Nível {alert.alertLevel}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{alert.alertMessage}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessDetail; 