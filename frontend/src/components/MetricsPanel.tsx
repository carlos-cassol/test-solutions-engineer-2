import React from 'react';

interface MetricsPanelProps {
  total: number;
  active: number;
  atRisk: number;
  overdue: number;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ total, active, atRisk, overdue }) => {
  const metrics = [
    {
      label: 'Total',
      value: total,
      color: 'bg-blue-500',
      text: 'T'
    },
    {
      label: 'Active',
      value: active,
      color: 'bg-green-500',
      text: 'A'
    },
    {
      label: 'At Risk',
      value: atRisk,
      color: 'bg-yellow-500',
      text: 'R'
    },
    {
      label: 'Overdue',
      value: overdue,
      color: 'bg-red-500',
      text: 'O'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center text-white text-xl font-bold`}>
              {metric.text}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsPanel; 