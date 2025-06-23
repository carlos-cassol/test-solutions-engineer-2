import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProcessCard from './ProcessCard';
import MetricsPanel from './MetricsPanel';
import AlertsPanel from './AlertsPanel';
import WebhookTester from './WebhookTester';
import AdvancedFilters from './AdvancedFilters';
import { Process } from '../types/Process';

const Dashboard: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWebhookTester, setShowWebhookTester] = useState(false);

  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    setFilteredProcesses(processes);
  }, [processes]);

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

  const handleFiltersChange = (filtered: Process[]) => {
    setFilteredProcesses(filtered);
  };

  const activeProcesses = processes.filter(p => p.status === 'ACTIVE');
  const atRiskProcesses = processes.filter(p => p.status === 'AT_RISK');
  const overdueProcesses = processes.filter(p => p.status === 'OVERDUE');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Radar Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of RIDEC processes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWebhookTester(!showWebhookTester)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showWebhookTester ? 'Hide' : 'Show'} Tester
          </button>
          <button
            onClick={fetchProcesses}
            className="bg-test-radar-600 text-white px-4 py-2 rounded-lg hover:bg-test-radar-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {showWebhookTester && (
        <WebhookTester onWebhookSent={fetchProcesses} />
      )}

      <MetricsPanel 
        total={processes.length}
        active={activeProcesses.length}
        atRisk={atRiskProcesses.length}
        overdue={overdueProcesses.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AdvancedFilters 
            processes={processes} 
            onFiltersChange={handleFiltersChange} 
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <AlertsPanel processes={processes} />

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Processes</h2>
                <span className="text-sm text-gray-500">
                  {filteredProcesses.length} of {processes.length} processes
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-test-radar-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading processes...</p>
              </div>
            ) : filteredProcesses.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  {processes.length === 0 ? 'No processes found' : 'No processes match your filters'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {processes.length === 0 
                    ? 'Use the webhook tester above to create a process'
                    : 'Try adjusting your filters or search terms'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {filteredProcesses.map((process) => (
                  <Link key={process.id} to={`/process/${process.id}`}>
                    <ProcessCard process={process} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 