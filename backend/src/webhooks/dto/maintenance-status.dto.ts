import {
	IsEnum,
	IsISO8601,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType, MaintenanceStatus } from '../enums/webhooks.enums';

export class MaintenanceData {
	@ApiProperty({
		description: 'ID único do processo',
		example: 'proc_123456789',
	})
	@IsString()
	processId: string;

	@ApiProperty({
		description: 'ID do veículo',
		example: 'VEH001',
	})
	@IsString()
	vehicleId: string;

	@ApiProperty({
		description: 'Tipo de manutenção',
		enum: MaintenanceType,
		example: MaintenanceType.PREVENTIVE,
	})
	@IsEnum(MaintenanceType)
	maintenanceType: MaintenanceType;

	@ApiProperty({
		description: 'Timestamp do evento em formato ISO 8601',
		example: '2024-01-15T10:30:00Z',
	})
	@IsISO8601()
	timestamp: string;

	@ApiProperty({
		description: 'Dados adicionais do evento',
		required: false,
		example: { priority: 'high', location: 'garage_a' },
	})
	@IsOptional()
	metadata?: any;
}

export class MaintenanceWebhook {
	@ApiProperty({
		description: 'Tipo do evento de manutenção',
		enum: MaintenanceStatus,
		example: MaintenanceStatus.CREATED,
	})
	@IsEnum(MaintenanceStatus)
	event: MaintenanceStatus;

	@ApiProperty({
		description: 'Dados do evento de manutenção',
		type: MaintenanceData,
	})
	@IsObject()
	data: MaintenanceData;
}
