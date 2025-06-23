import React from 'react';

interface AIInsight {
  id: string;
  type: 'PREDICTION' | 'ANOMALY' | 'RECOMMENDATION';
  confidence: number;
  message: string;
  timestamp: string;
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights }) => {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'PREDICTION':
        return 'border-blue-500 bg-blue-50';
      case 'ANOMALY':
        return 'border-red-500 bg-red-50';
      case 'RECOMMENDATION':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMessage = (message: string) => {
    if (message.includes('{') && message.includes('}')) {
      try {
        const jsonMatches = message.match(/\{[^}]+\}/g);
        if (jsonMatches && jsonMatches.length > 1) {
          return jsonMatches.map((jsonStr, index) => {
            try {
              const parsed = JSON.parse(jsonStr);
              return (
                <div key={index} className="mb-3 p-3 bg-white rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {parsed.type || 'Insight'}
                    </span>
                    {parsed.confidence && (
                      <span className={`text-xs ${getConfidenceColor(parsed.confidence)}`}>
                        {Math.round(parsed.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{parsed.message}</p>
                </div>
              );
            } catch {
              return (
                <div key={index} className="mb-2 p-2 bg-gray-100 rounded text-sm">
                  {jsonStr}
                </div>
              );
            }
          });
        }
      } catch {
      }
    }
    
    return <p className="text-sm text-gray-600">{message}</p>;
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          AI Insights
        </h3>
        <p className="text-gray-600">No AI insights available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        AI Insights
        <span className="text-sm font-normal text-gray-500">
          ({insights.length} insight{insights.length > 1 ? 's' : ''})
        </span>
      </h3>
      
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 p-4 rounded-r-lg ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  insight.type === 'PREDICTION' ? 'bg-blue-100 text-blue-800' :
                  insight.type === 'ANOMALY' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {insight.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
                <span>•</span>
                <span>{new Date(insight.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {formatMessage(insight.message)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightsPanel; 