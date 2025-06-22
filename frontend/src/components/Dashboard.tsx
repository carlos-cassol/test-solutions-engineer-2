import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProcessCard from './ProcessCard';
import MetricsPanel from './MetricsPanel';
import AlertsPanel from './AlertsPanel';
import { Process } from '../types/Process';

const Dashboard: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const response = await fetch('http://localhost:3000/processes');
      if (response.ok) {
        const data = await response.json();
        setProcesses(data);
      }
    } catch (error) {
      console.error('Error fetching processes:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProcesses = processes.filter(p => p.status === 'ACTIVE');
  const atRiskProcesses = processes.filter(p => p.status === 'AT_RISK');
  const overdueProcesses = processes.filter(p => p.status === 'OVERDUE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Radar Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitoramento em tempo real dos processos RIDEC</p>
        </div>
        <button
          onClick={fetchProcesses}
          className="bg-test-radar-600 text-white px-4 py-2 rounded-lg hover:bg-test-radar-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Metrics Panel */}
      <MetricsPanel 
        total={processes.length}
        active={activeProcesses.length}
        atRisk={atRiskProcesses.length}
        overdue={overdueProcesses.length}
      />

      {/* Alerts Panel */}
      <AlertsPanel processes={processes} />

      {/* Processes List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Processos Ativos</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-test-radar-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando processos...</p>
          </div>
        ) : processes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Nenhum processo encontrado</p>
            <p className="text-sm text-gray-500 mt-1">
              Envie um webhook para criar um processo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {processes.map((process) => (
              <Link key={process.id} to={`/process/${process.id}`}>
                <ProcessCard process={process} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 