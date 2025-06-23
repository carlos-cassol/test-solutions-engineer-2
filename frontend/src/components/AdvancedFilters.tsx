import React, { useState } from 'react';
import { Process } from '../types/Process';
import TrafficLightIndicator from './TrafficLightIndicator';

interface AdvancedFiltersProps {
  processes: Process[];
  onFiltersChange: (filteredProcesses: Process[]) => void;
}

interface FilterState {
  status: string[];
  type: string[];
  stage: string[];
  searchTerm: string;
  hasAlerts: boolean | null;
  hasAIInsights: boolean | null;
  dateRange: {
    start: string;
    end: string;
  };
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ processes, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    type: [],
    stage: [],
    searchTerm: '',
    hasAlerts: null,
    hasAIInsights: null,
    dateRange: {
      start: '',
      end: ''
    }
  });

  const uniqueStatuses = Array.from(new Set(processes.map(p => p.status)));
  const uniqueTypes = Array.from(new Set(processes.map(p => p.type)));
  const uniqueStages = Array.from(new Set(processes.map(p => p.currentStage)));

  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...processes];

    if (newFilters.searchTerm) {
      const searchLower = newFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(process =>
        process.title.toLowerCase().includes(searchLower) ||
        process.vehicleId?.toLowerCase().includes(searchLower) ||
        process.id.toLowerCase().includes(searchLower)
      );
    }

    if (newFilters.status.length > 0) {
      filtered = filtered.filter(process => newFilters.status.includes(process.status));
    }

    if (newFilters.type.length > 0) {
      filtered = filtered.filter(process => newFilters.type.includes(process.type));
    }

    if (newFilters.stage.length > 0) {
      filtered = filtered.filter(process => newFilters.stage.includes(process.currentStage));
    }

    if (newFilters.hasAlerts !== null) {
      filtered = filtered.filter(process => 
        newFilters.hasAlerts ? process.alerts.length > 0 : process.alerts.length === 0
      );
    }

    if (newFilters.hasAIInsights !== null) {
      filtered = filtered.filter(process => 
        newFilters.hasAIInsights ? process.aiInsights.length > 0 : process.aiInsights.length === 0
      );
    }

    if (newFilters.dateRange.start || newFilters.dateRange.end) {
      filtered = filtered.filter(process => {
        const processDate = new Date(process.createdAt);
        const startDate = newFilters.dateRange.start ? new Date(newFilters.dateRange.start) : null;
        const endDate = newFilters.dateRange.end ? new Date(newFilters.dateRange.end) : null;

        if (startDate && endDate) {
          return processDate >= startDate && processDate <= endDate;
        } else if (startDate) {
          return processDate >= startDate;
        } else if (endDate) {
          return processDate <= endDate;
        }
        return true;
      });
    }

    onFiltersChange(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleArrayFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      status: [],
      type: [],
      stage: [],
      searchTerm: '',
      hasAlerts: null,
      hasAIInsights: null,
      dateRange: {
        start: '',
        end: ''
      }
    };
    setFilters(clearedFilters);
    onFiltersChange(processes);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.type.length > 0) count++;
    if (filters.stage.length > 0) count++;
    if (filters.searchTerm) count++;
    if (filters.hasAlerts !== null) count++;
    if (filters.hasAIInsights !== null) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()} active
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Busca rápida sempre visível */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search processes..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
        />
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {uniqueStatuses.map(status => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                    className="rounded"
                  />
                  <TrafficLightIndicator status={status} size="sm" showLabel={false} />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {uniqueTypes.map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={(e) => handleArrayFilterChange('type', type, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stage Filter */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Current Stage</h4>
            <div className="grid grid-cols-5 gap-2">
              {['R', 'I', 'D', 'E', 'C'].map(stage => (
                <label key={stage} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.stage.includes(stage)}
                    onChange={(e) => handleArrayFilterChange('stage', stage, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-bold">{stage}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Alerts</h4>
              <select
                value={filters.hasAlerts === null ? '' : filters.hasAlerts.toString()}
                onChange={(e) => handleFilterChange('hasAlerts', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
              >
                <option value="">All</option>
                <option value="true">Has Alerts</option>
                <option value="false">No Alerts</option>
              </select>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">AI Insights</h4>
              <select
                value={filters.hasAIInsights === null ? '' : filters.hasAIInsights.toString()}
                onChange={(e) => handleFilterChange('hasAIInsights', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
              >
                <option value="">All</option>
                <option value="true">Has Insights</option>
                <option value="false">No Insights</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Date Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-test-radar-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-2 border-t">
            <button
              onClick={clearAllFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters; 