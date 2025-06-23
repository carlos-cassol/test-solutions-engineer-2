import React from 'react';

interface TrafficLightIndicatorProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TrafficLightIndicator: React.FC<TrafficLightIndicatorProps> = ({ 
  status, 
  size = 'md', 
  showLabel = true 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          color: 'bg-green-500',
          label: 'Active',
          description: 'Process running normally'
        };
      case 'AT_RISK':
        return {
          color: 'bg-yellow-500',
          label: 'At Risk',
          description: 'SLA > 80% consumed'
        };
      case 'OVERDUE':
        return {
          color: 'bg-red-500',
          label: 'Overdue',
          description: 'SLA exceeded'
        };
      case 'COMPLETED':
        return {
          color: 'bg-blue-500',
          label: 'Completed',
          description: 'Process finished'
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-4 h-4',
          label: 'text-xs'
        };
      case 'lg':
        return {
          container: 'w-6 h-6',
          label: 'text-sm'
        };
      default:
        return {
          container: 'w-5 h-5',
          label: 'text-sm'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${config.color} ${sizeClasses.container} rounded-full shadow-sm border-2 border-white`}
        title={config.description}
      />
      {showLabel && (
        <span className={`${sizeClasses.label} font-medium text-gray-700`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

export default TrafficLightIndicator; 