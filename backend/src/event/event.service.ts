import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventService {
	constructor(private readonly prisma: PrismaService) {}

	public async logEvent(
		processId: string,
		eventType: string,
		eventData: any,
	): Promise<void> {
		try {
			await this.prisma.processEvent.create({
				data: {
					processId: processId,
					event: eventType,
					data: {
						...eventData,
						timestamp: new Date().toISOString(),
					},
				},
			});
		} catch (error) {
			console.error(`Error logging event ${eventType}:`, error);
		}
	}
}
