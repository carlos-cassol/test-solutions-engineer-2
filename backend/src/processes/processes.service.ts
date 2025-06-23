import { Injectable } from '@nestjs/common';
import { MaintenanceWebhook } from '../webhooks/dto/maintenance-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Process, ProcessStage, StageKey } from 'generated/prisma';
import { SLA_CONFIG } from './constants/processes.constants';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../AI/ai.service';
import { EventService } from '../event/event.service';
import { AlertsService } from '../alerts/alerts.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProcessesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
		private readonly aiService: AiService,
		private readonly eventService: EventService,
		private readonly alertsService: AlertsService,
	) {}

	async processMaintenanceEvent(dto: MaintenanceWebhook) {
		try {
			const process = await this.findOrCreateProcess(dto);

			await this.eventService.logEvent(process.id, 'webhook.received', {
				event: dto.event,
				vehicleId: dto.data.vehicleId,
				maintenanceType: dto.data.maintenanceType,
				webhookData: dto.data,
			});

			const targetStage = this.mapEventToStage(dto.event);

			await this.updateStages(process, targetStage);

			if (process.currentStage !== StageKey.R) {
				await this.calculateSLAAndAlerts(process);

				await this.aiService.executeAI(process);
			}

			return await this.getProcessById(process.id);
		} catch (error) {
			throw new Error(`Error processing maintenance event: ${error.message}`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async processFinancialEvent(_dto: any) {
		await Promise.resolve();
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async processSupplyEvent(_dto: any) {
		await Promise.resolve();
		return null;
	}

	private async findOrCreateProcess(
		payload: MaintenanceWebhook,
	): Promise<Process & { stages: ProcessStage[] }> {
		try {
			let process = await this.prisma.process.findUnique({
				where: { id: payload.data.processId },
				include: { stages: true },
			});

			if (!process) {
				process = await this.prisma.process.create({
					data: {
						id: uuidv4(),
						title: `Maintenance ${payload.data.maintenanceType} - Vehicle ${payload.data.vehicleId}`,
						type: 'MAINTENANCE',
						vehicleId: payload.data.vehicleId,
						currentStage: 'R',
						status: 'ACTIVE',
						stages: {
							create: [
								{ stageKey: 'R', sla: SLA_CONFIG.MAINTENANCE.R },
								{ stageKey: 'I', sla: SLA_CONFIG.MAINTENANCE.I },
								{ stageKey: 'D', sla: SLA_CONFIG.MAINTENANCE.D },
								{ stageKey: 'E', sla: SLA_CONFIG.MAINTENANCE.E },
								{ stageKey: 'C', sla: SLA_CONFIG.MAINTENANCE.C },
							],
						},
					},
					include: { stages: true },
				});
			}

			return process;
		} catch (error) {
			throw new Error(`Error finding/creating process: ${error.message}`);
		}
	}

	private mapEventToStage(event: string): StageKey {
		switch (event) {
			case 'maintenance.created':
				return 'R';
			case 'maintenance.identified':
				return 'I';
			case 'maintenance.approved':
				return 'D';
			case 'maintenance.executing':
				return 'E';
			case 'maintenance.completed':
				return 'C';
			default:
				throw new Error(`Unsupported event: ${event}`);
		}
	}

	private async updateStages(
		process: Process & { stages: ProcessStage[] },
		targetStage: StageKey,
	): Promise<void> {
		try {
			const currentStage = process.stages.find(
				(s) => s.stageKey === process.currentStage,
			);
			if (currentStage && currentStage.startTime && !currentStage.endTime) {
				await this.prisma.processStage.update({
					where: { id: currentStage.id },
					data: { endTime: new Date() },
				});

				await this.eventService.logEvent(process.id, 'stage.completed', {
					stage: process.currentStage,
					startTime: currentStage.startTime,
					endTime: new Date(),
					duration:
						(new Date().getTime() - currentStage.startTime.getTime()) / 1000,
				});
			}

			const stageOrder: StageKey[] = ['R', 'I', 'D', 'E', 'C'];
			const currentIndex = stageOrder.indexOf(process.currentStage);
			const targetIndex = stageOrder.indexOf(targetStage);

			for (let i = currentIndex + 1; i <= targetIndex; i++) {
				const stageKey = stageOrder[i];
				const existingStage = process.stages.find(
					(s) => s.stageKey === stageKey,
				);

				if (!existingStage) {
					await this.prisma.processStage.create({
						data: {
							processId: process.id,
							stageKey: stageKey,
							startTime: i === targetIndex ? new Date() : null,
							sla: this.getSLAForStage(stageKey),
						},
					});

					if (i < targetIndex) {
						await this.alertsService.createAlert({
							processId: process.id,
							alertLevel: 2,
							alertMessage: `Inconsistent process: Stage ${stageKey} created without startTime (skipped)`,
						});

						await this.eventService.logEvent(process.id, 'stage.skipped', {
							stage: stageKey,
							reason: 'Process jumped to later stage',
							previousStage: process.currentStage,
							targetStage: targetStage,
						});
					}
				}
			}

			const targetStageRecord = await this.prisma.processStage.findFirst({
				where: { processId: process.id, stageKey: targetStage },
			});

			if (targetStageRecord && !targetStageRecord.startTime) {
				await this.prisma.processStage.update({
					where: { id: targetStageRecord.id },
					data: { startTime: new Date() },
				});

				await this.eventService.logEvent(process.id, 'stage.started', {
					stage: targetStage,
					startTime: new Date(),
					sla: targetStageRecord.sla,
				});
			}

			await this.prisma.process.update({
				where: { id: process.id },
				data: { currentStage: targetStage },
			});

			if (process.currentStage !== targetStage) {
				await this.eventService.logEvent(process.id, 'stage.changed', {
					oldStage: process.currentStage,
					newStage: targetStage,
					previousStage: process.currentStage,
				});
			}
		} catch (error) {
			throw new Error(`Error updating stages: ${error.message}`);
		}
	}

	private getSLAForStage(stageKey: StageKey): number {
		return SLA_CONFIG.MAINTENANCE[stageKey];
	}

	private async calculateSLAAndAlerts(
		process: Process & { stages: ProcessStage[] },
	): Promise<void> {
		try {
			const updatedProcess = await this.prisma.process.findUnique({
				where: { id: process.id },
				include: { stages: true },
			});

			if (!updatedProcess) return;

			const currentStage = updatedProcess.stages.find(
				(s) => s.stageKey === updatedProcess.currentStage,
			);

			if (!currentStage || !currentStage.startTime) return;

			const now = new Date();
			const elapsedTime =
				(now.getTime() - currentStage.startTime.getTime()) / 1000;
			const slaPercentage = (elapsedTime / currentStage.sla) * 100;

			let newStatus = updatedProcess.status;
			let alertLevel = 0;
			let alertMessage = '';

			if (slaPercentage > 100) {
				newStatus = 'OVERDUE';
				alertLevel = 4;
				alertMessage = `Process overdue: ${slaPercentage.toFixed(1)}% of SLA exceeded in stage ${updatedProcess.currentStage}`;
			} else if (slaPercentage > 80) {
				newStatus = 'AT_RISK';
				alertLevel = 3;
				alertMessage = `Process at risk: ${slaPercentage.toFixed(1)}% of SLA consumed in stage ${updatedProcess.currentStage}`;
			} else {
				newStatus = 'ACTIVE';
				if (
					updatedProcess.status === 'OVERDUE' ||
					updatedProcess.status === 'AT_RISK'
				) {
					alertLevel = 1;
					alertMessage = `Process recovered: ${slaPercentage.toFixed(1)}% of SLA in stage ${updatedProcess.currentStage}`;
				}
			}

			if (newStatus !== updatedProcess.status) {
				await this.prisma.process.update({
					where: { id: process.id },
					data: { status: newStatus },
				});
			}

			if (alertLevel > 0) {
				const alert = await this.alertsService.createAlert({
					processId: process.id,
					alertLevel: alertLevel,
					alertMessage: alertMessage,
				});

				await this.eventService.logEvent(process.id, 'alert.generated', {
					alertId: alert.id,
					alertLevel: alertLevel,
					alertMessage: alertMessage,
					slaPercentage: slaPercentage,
					stage: updatedProcess.currentStage,
				});
			}

			if (newStatus !== updatedProcess.status) {
				await this.eventService.logEvent(process.id, 'status.changed', {
					oldStatus: updatedProcess.status,
					newStatus: newStatus,
					slaPercentage: slaPercentage,
					stage: updatedProcess.currentStage,
				});
			}
		} catch (error) {
			throw new Error(`Error calculating SLA: ${error.message}`);
		}
	}

	async getProcessById(id: string): Promise<
		| (Process & {
				stages: ProcessStage[];
				events: any[];
				aiInsights: any[];
				alerts: any[];
		  })
		| null
	> {
		return await this.prisma.process.findUnique({
			where: { id },
			include: { stages: true, events: true, alerts: true, aiInsights: true },
		});
	}

	async getAllProcesses(): Promise<
		(Process & {
			stages: ProcessStage[];
			events: any[];
			aiInsights: any[];
			alerts: any[];
		})[]
	> {
		return await this.prisma.process.findMany({
			include: { stages: true, events: true, alerts: true, aiInsights: true },
			orderBy: { createdAt: 'desc' },
		});
	}
}
