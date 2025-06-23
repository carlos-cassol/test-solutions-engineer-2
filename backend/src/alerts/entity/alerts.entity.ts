import { AlertLevelEnum } from '../enum/alerts.enum';

export class AlertsEntity {
	id: string;
	processId: string;
	alertMessage: string;
	alertLevel: AlertLevelEnum;
	createdAt: Date;
	updatedAt: Date;
}
