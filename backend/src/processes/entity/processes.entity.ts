import { ProcessStatus, ProcessType, StageKey } from '../enums/process.enum';

export class StageInfo {
	startTime?: Date;
	endTime?: Date;
	sla: number;
}

export class ProcessEntity {
	id: string;
	title: string;
	type: ProcessType;
	vehicleId?: string;
	currentStage: StageKey;
	status: ProcessStatus;
	createdAt: Date;
	predictedCompletionTime?: Date;
	riskScore?: number;
	stages: {
		R: StageInfo;
		I: StageInfo;
		D: StageInfo;
		E: StageInfo;
		C: StageInfo;
	};
}
