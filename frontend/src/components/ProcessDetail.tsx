import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Process } from '../types/Process';
import AIInsightsPanel from './AIInsightsPanel';
import TrafficLightIndicator from './TrafficLightIndicator';

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
        <p className="mt-2 text-gray-600">Loading process...</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Process not found</p>
        <Link to="/" className="text-test-radar-600 hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-test-radar-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{process.title}</h1>
          <p className="text-gray-600 mt-2">RIDEC process details</p>
        </div>
        <div className="text-right">
          <TrafficLightIndicator status={process.status} size="lg" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">RIDEC Timeline</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Information</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-gray-900">{process.type}</span>
            </div>
            {process.vehicleId && (
              <div>
                <span className="font-medium text-gray-700">Vehicle:</span>
                <span className="ml-2 text-gray-900">{process.vehicleId}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Current Stage:</span>
              <span className="ml-2 text-gray-900">{process.currentStage}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-900">
                {new Date(process.createdAt).toLocaleString()}
              </span>
            </div>
            {process.predictedCompletionTime && (
              <div>
                <span className="font-medium text-gray-700">Predicted Completion:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(process.predictedCompletionTime).toLocaleString()}
                </span>
              </div>
            )}
            {process.riskScore && (
              <div>
                <span className="font-medium text-gray-700">Risk Score:</span>
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

        <div className="lg:col-span-2">
          <AIInsightsPanel insights={process.aiInsights} />
        </div>
      </div>

      {process.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
          <div className="space-y-3">
            {process.alerts.map((alert) => (
              <div key={alert.id} className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.alertLevel >= 4 ? 'bg-red-100 text-red-800' :
                    alert.alertLevel >= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    Level {alert.alertLevel}
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

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {process.stages.map((stage) => {
            const isActive = process.currentStage === stage.stageKey;
            const isCompleted = stage.endTime;
            const startTime = stage.startTime ? new Date(stage.startTime) : null;
            const endTime = stage.endTime ? new Date(stage.endTime) : null;
            const duration = startTime && endTime ? 
              Math.round((endTime.getTime() - startTime.getTime()) / 1000) : null;
            const slaPercentage = startTime && !endTime ? 
              Math.round(((Date.now() - startTime.getTime()) / 1000 / stage.sla) * 100) : null;

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-lg border-2 ${
                  isActive ? 'border-test-radar-500 bg-test-radar-50' :
                  isCompleted ? 'border-green-500 bg-green-50' :
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 ${
                    isActive ? 'bg-test-radar-600' :
                    isCompleted ? 'bg-green-500' :
                    'bg-gray-400'
                  }`}>
                    {stage.stageKey}
                  </div>
                  <h4 className="font-semibold text-sm mb-2">
                    {stage.stageKey === 'R' ? 'Receive' :
                     stage.stageKey === 'I' ? 'Identify' :
                     stage.stageKey === 'D' ? 'Decide' :
                     stage.stageKey === 'E' ? 'Execute' : 'Conclude'}
                  </h4>
                  
                  <div className="text-xs space-y-1">
                    <div>SLA: {stage.sla}s</div>
                    {startTime && (
                      <div>Start: {startTime.toLocaleTimeString()}</div>
                    )}
                    {endTime && (
                      <div>End: {endTime.toLocaleTimeString()}</div>
                    )}
                    {duration && (
                      <div className="font-medium">
                        Duration: {duration}s
                      </div>
                    )}
                    {slaPercentage && (
                      <div className={`font-medium ${
                        slaPercentage > 100 ? 'text-red-600' :
                        slaPercentage > 80 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {slaPercentage}% of SLA
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessDetail; 