import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('websocket-info')
	getWebSocketInfo() {
		return {
			message: 'WebSocket is available at ws://localhost:3000',
			endpoints: {
				notifications: '/notifications/stats',
				testStageChange: 'POST /notifications/test/stage-change',
				testCriticalAlert: 'POST /notifications/test/critical-alert',
				testProcessUpdate: 'POST /notifications/test/process-update',
			},
			events: [
				'connected',
				'stage-change',
				'critical-alert',
				'process-update',
				'room-joined',
				'room-left',
			],
		};
	}
}
