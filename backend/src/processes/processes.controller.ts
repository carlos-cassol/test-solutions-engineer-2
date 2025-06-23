import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { MaintenanceWebhook } from 'src/webhooks/dto/maintenance-status.dto';

@Controller('processes')
export class ProcessesController {
	constructor(private readonly processesService: ProcessesService) {}

	@Get()
	async getAllProcesses() {
		return await this.processesService.getAllProcesses();
	}

	@Post('test-webhook')
	async testWebhook(@Body() webhook: MaintenanceWebhook) {
		return await this.processesService.processMaintenanceEvent(webhook);
	}

	@Get('test-sla/:processId')
	async testSLA(
		@Param('processId') processId: string,
		@Query('slaPercentage') slaPercentage: string,
	) {
		const percentage = parseFloat(slaPercentage) || 50;

		const process = await this.processesService.getProcessById(processId);
		if (!process) {
			return { error: 'Process not found' };
		}

		const currentStage = process.stages.find(
			(s) => s.stageKey === process.currentStage,
		);
		if (!currentStage || !currentStage.startTime) {
			return { error: 'Current stage not found or not started' };
		}

		const targetElapsedSeconds = (currentStage.sla * percentage) / 100;
		const targetStartTime = new Date(Date.now() - targetElapsedSeconds * 1000);

		await this.processesService['prisma'].processStage.update({
			where: { id: currentStage.id },
			data: { startTime: targetStartTime },
		});

		await this.processesService['calculateSLAAndAlerts'](process);

		return await this.processesService.getProcessById(processId);
	}

	@Post('test-ai/:processId')
	async testAI(@Param('processId') processId: string) {
		const process = await this.processesService.getProcessById(processId);
		if (!process) {
			return { error: 'Process not found' };
		}

		await this.processesService['executeAI'](process);

		return await this.processesService.getProcessById(processId);
	}

	@Get(':id')
	async getProcess(@Param('id') id: string) {
		return await this.processesService.getProcessById(id);
	}

	@Get(':id/alerts')
	async getProcessAlerts(@Param('id') id: string) {
		const process = await this.processesService.getProcessById(id);
		if (!process) {
			return { error: 'Process not found' };
		}
		return process.alerts;
	}

	@Get(':id/events')
	async getProcessEvents(@Param('id') id: string) {
		const process = await this.processesService.getProcessById(id);
		if (!process) {
			return { error: 'Process not found' };
		}
		return process.events;
	}
}
