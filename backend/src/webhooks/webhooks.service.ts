import { BadRequestException, Injectable } from '@nestjs/common';
import { ProcessesService } from 'src/processes/processes.service';
import { MaintenanceWebhook } from './dto/maintenance-status.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

	handleFinancialEvent() {
		throw new Error('Method not implemented.');
	}

	handleSupplyEvent() {
		throw new Error('Method not implemented.');
	}
}
