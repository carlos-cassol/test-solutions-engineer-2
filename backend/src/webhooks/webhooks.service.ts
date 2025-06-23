import { BadRequestException, Injectable } from '@nestjs/common';
import { ProcessesService } from '../processes/processes.service';
import { MaintenanceWebhook } from './dto/maintenance-status.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
	constructor(
		private readonly processesService: ProcessesService,
		private readonly prisma: PrismaService,
	) {}

	async handleMaintenanceEvent(dto: MaintenanceWebhook) {
		try {
			return await this.processesService.processMaintenanceEvent(dto);
		} catch (error) {
			throw new BadRequestException(
				`Error processing maintenance event: ${error.message}`,
			);
		}
	}

	async handleFinancialEvent() {
		throw new Error('Method not implemented.');
	}

	async handleSupplyEvent() {
		throw new Error('Method not implemented.');
	}
}
