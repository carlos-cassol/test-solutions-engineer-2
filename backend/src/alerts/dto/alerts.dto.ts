import { IsString, IsNumber } from 'class-validator';

export class AlertsDto {
	@IsString()
	processId: string;

	@IsString()
	alertMessage: string;

	@IsNumber()
	alertLevel: number;
}
