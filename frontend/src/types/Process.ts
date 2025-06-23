export interface ProcessStage {
  id: string;
  stageKey: 'R' | 'I' | 'D' | 'E' | 'C';
  startTime: string | null;
  endTime: string | null;
  sla: number;
}

export interface Alert {
  id: string;
  alertLevel: number;
  alertMessage: string;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  type: 'PREDICTION' | 'ANOMALY' | 'RECOMMENDATION';
  confidence: number;
  message: string;
  timestamp: string;
}

export interface Process {
  id: string;
  title: string;
  type: 'MAINTENANCE' | 'FINANCIAL' | 'SUPPLY';
  vehicleId?: string;
  currentStage: 'R' | 'I' | 'D' | 'E' | 'C';
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'AT_RISK';
  createdAt: string;
  predictedCompletionTime?: string;
  riskScore?: number;
  stages: ProcessStage[];
  alerts: Alert[];
  aiInsights: AIInsight[];
} 