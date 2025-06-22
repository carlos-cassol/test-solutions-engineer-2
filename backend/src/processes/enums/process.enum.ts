export enum ProcessType {
	MAINTENANCE = 'maintenance',
	FINANCIAL = 'financial',
	SUPPLY = 'supply',
}

export enum ProcessStatus {
	ACTIVE = 'active',
	COMPLETED = 'completed',
	OVERDUE = 'overdue',
	AT_RISK = 'at_risk',
}

export enum ProcessStage {
	RECEIVED = 'received',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
}

export enum StageKey {
	R = 'R', // Receive
	I = 'I', // Identify
	D = 'D', // Decide
	E = 'E', // Execute
	C = 'C', // Conclude
}
