import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AlertsDto } from './dto/alerts.dto';

@Injectable()
export class AlertsService {
	constructor(private readonly prisma: PrismaService) {}

	public async createAlert(alert: AlertsDto) {
		return await this.prisma.alerts.create({
			data: {
				processId: alert.processId,
				alertLevel: alert.alertLevel,
				alertMessage: alert.alertMessage,
			},
		});
	}
}
