import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface WebhookTesterProps {
  onWebhookSent?: () => void;
}

const WebhookTester: React.FC<WebhookTesterProps> = ({ onWebhookSent }) => {
  const [selectedEvent, setSelectedEvent] = useState('maintenance.created');
  const [vehicleId, setVehicleId] = useState('TEST001');
  const [maintenanceType, setMaintenanceType] = useState('PREVENTIVE');
  const [processId, setProcessId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const events = [
    { value: 'maintenance.created', label: 'Created' },
    { value: 'maintenance.identified', label: 'Identified' },
    { value: 'maintenance.approved', label: 'Approved' },
    { value: 'maintenance.executing', label: 'Executing' },
    { value: 'maintenance.completed', label: 'Completed' },
  ];

  const maintenanceTypes = [
    { value: 'PREVENTIVE', label: 'Preventive' },
    { value: 'CORRECTIVE', label: 'Corrective' },
    { value: 'EMERGENCY', label: 'Emergency' },
  ];

  const generateProcessId = () => {
    const guid = uuidv4();
    setProcessId(guid);
  };

  const sendWebhook = async () => {
    if (!processId) {
      alert('Please generate a Process ID first');
      return;
    }

    setLoading(true);
    setResult(null);

    const webhookPayload = {
      event: selectedEvent,
      data: {
        processId: processId,
        vehicleId: vehicleId,
        maintenanceType: maintenanceType,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const response = await fetch('http://localhost:3000/webhooks/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      const data = await response.json();
      setResult({ success: response.ok, data, status: response.status });

      if (response.ok && onWebhookSent) {
        onWebhookSent();
      }
    } catch (error) {
      setResult({ success: false, error: (error as Error).message, status: 500 });
    } finally {
      setLoading(false);
    }
  };

  const sendProgressiveWebhooks = async () => {
    if (!processId) {
      alert('Please generate a Process ID first');
      return;
    }

    setLoading(true);
    setResult(null);

    const results = [];

    for (const event of events) {
      const webhookPayload = {
        event: event.value,
        data: {
          processId: processId,
          vehicleId: vehicleId,
          maintenanceType: maintenanceType,
          timestamp: new Date().toISOString(),
        },
      };

      try {
        const response = await fetch('http://localhost:3000/webhooks/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        const data = await response.json();
        results.push({ event: event.value, success: response.ok, data, status: response.status });

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ event: event.value, success: false, error: (error as Error).message, status: 500 });
      }
    }

    setResult({ success: true, data: results, progressive: true });
    setLoading(false);

    if (onWebhookSent) {
      onWebhookSent();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Tester</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Process ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
              placeholder="Process ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
            />
            <button
              onClick={generateProcessId}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle ID
          </label>
          <input
            type="text"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
          >
            {events.map((event) => (
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance Type
          </label>
          <select
            value={maintenanceType}
            onChange={(e) => setMaintenanceType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
          >
            {maintenanceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={sendWebhook}
          disabled={loading || !processId}
          className="px-6 py-2 bg-test-radar-600 text-white rounded-md hover:bg-test-radar-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Webhook'}
        </button>
        
        <button
          onClick={sendProgressiveWebhooks}
          disabled={loading || !processId}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Progressive (R→I→D→E→C)'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-md ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className="font-medium mb-2">
            {result.success ? 'Success' : 'Error'}
          </h4>
          
          {result.progressive ? (
            <div className="space-y-2">
              {result.data.map((item: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{item.event}:</span>
                  <span className={`ml-2 ${item.success ? 'text-green-600' : 'text-red-600'}`}>
                    {item.success ? 'Success' : 'Error'}
                  </span>
                  {item.data?.data?.currentStage && (
                    <span className="ml-2 text-gray-600">
                      → Stage: {item.data.data.currentStage}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-sm overflow-auto max-h-40">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default WebhookTester; 