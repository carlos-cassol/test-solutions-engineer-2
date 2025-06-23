import { Test, TestingModule } from '@nestjs/testing';
import { ProcessesService } from './processes.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../AI/ai.service';
import { EventService } from '../event/event.service';
import { AlertsService } from '../alerts/alerts.service';
import { MaintenanceWebhook } from '../webhooks/dto/maintenance-status.dto';
import {
	MaintenanceStatus,
	MaintenanceType,
} from '../webhooks/enums/webhooks.enums';
import { Process, ProcessStage, StageKey } from 'generated/prisma';

describe('ProcessesService', () => {
	let service: ProcessesService;
	let prismaService: jest.Mocked<PrismaService>;
	let aiService: jest.Mocked<AiService>;
	let eventService: jest.Mocked<EventService>;
	let alertsService: jest.Mocked<AlertsService>;

	const mockProcess = {
		id: 'test-process-123',
		title: 'Test Maintenance',
		type: 'MAINTENANCE' as const,
		vehicleId: 'TEST123',
		currentStage: 'R' as StageKey,
		status: 'ACTIVE' as const,
		createdAt: new Date(),
		updatedAt: new Date(),
		predictedCompletionTime: null,
		riskScore: null,
		stages: [
			{
				id: '1',
				processId: 'test-process-123',
				stageKey: 'R' as StageKey,
				startTime: new Date(),
				endTime: null,
				sla: 3600,
			},
			{
				id: '2',
				processId: 'test-process-123',
				stageKey: 'I' as StageKey,
				startTime: null,
				endTime: null,
				sla: 1800,
			},
		] as ProcessStage[],
	};

	beforeEach(async () => {
		const mockPrismaService = {
			process: {
				findUnique: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
				findMany: jest.fn(),
			},
			processStage: {
				create: jest.fn(),
				update: jest.fn(),
				findFirst: jest.fn(),
			},
		};

		const mockAiService = {
			executeAI: jest.fn(),
		};

		const mockEventService = {
			logEvent: jest.fn(),
		};

		const mockAlertsService = {
			createAlert: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProcessesService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
				{
					provide: ConfigService,
					useValue: { get: jest.fn() },
				},
				{
					provide: AiService,
					useValue: mockAiService,
				},
				{
					provide: EventService,
					useValue: mockEventService,
				},
				{
					provide: AlertsService,
					useValue: mockAlertsService,
				},
			],
		}).compile();

		service = module.get<ProcessesService>(ProcessesService);
		prismaService = module.get(PrismaService);
		aiService = module.get(AiService);
		eventService = module.get(EventService);
		alertsService = module.get(AlertsService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('processMaintenanceEvent', () => {
		it('should create new process when process does not exist', async () => {
			const webhookData: MaintenanceWebhook = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: 'new-process-123',
					vehicleId: 'NEW123',
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			(prismaService.process.findUnique as jest.Mock).mockResolvedValue(null);
			(prismaService.process.create as jest.Mock).mockResolvedValue(
				mockProcess as any,
			);
			(prismaService.process.update as jest.Mock).mockResolvedValue(
				mockProcess as any,
			);
			(prismaService.processStage.create as jest.Mock).mockResolvedValue(
				mockProcess.stages[0] as any,
			);
			(prismaService.processStage.update as jest.Mock).mockResolvedValue(
				mockProcess.stages[0] as any,
			);
			(prismaService.processStage.findFirst as jest.Mock).mockResolvedValue(
				mockProcess.stages[0] as any,
			);

			const result = await service.processMaintenanceEvent(webhookData);

			expect(prismaService.process.findUnique).toHaveBeenCalledWith({
				where: { id: 'new-process-123' },
				include: { stages: true },
			});
			expect(prismaService.process.create).toHaveBeenCalled();
			expect(eventService.logEvent).toHaveBeenCalledWith(
				expect.any(String),
				'webhook.received',
				expect.objectContaining({
					event: MaintenanceStatus.CREATED,
					vehicleId: 'NEW123',
				}),
			);
			expect(result).toBeDefined();
		});

		it('should update existing process when process exists', async () => {
			const webhookData: MaintenanceWebhook = {
				event: MaintenanceStatus.IDENTIFIED,
				data: {
					processId: 'existing-process-123',
					vehicleId: 'EXIST123',
					maintenanceType: MaintenanceType.CORRECTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			(prismaService.process.findUnique as jest.Mock).mockResolvedValue(
				mockProcess as any,
			);
			(prismaService.process.update as jest.Mock).mockResolvedValue(
				mockProcess as any,
			);
			(prismaService.processStage.update as jest.Mock).mockResolvedValue(
				mockProcess.stages[0] as any,
			);
			(prismaService.processStage.findFirst as jest.Mock).mockResolvedValue(
				mockProcess.stages[0] as any,
			);

			const result = await service.processMaintenanceEvent(webhookData);

			expect(prismaService.process.findUnique).toHaveBeenCalledWith({
				where: { id: 'existing-process-123' },
				include: { stages: true },
			});
			expect(prismaService.process.update).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should throw error for unsupported event', async () => {
			const webhookData: MaintenanceWebhook = {
				event: 'maintenance.invalid' as any,
				data: {
					processId: 'test-process-123',
					vehicleId: 'TEST123',
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			(prismaService.process.findUnique as jest.Mock).mockResolvedValue(
				mockProcess as any,
			);

			await expect(
				service.processMaintenanceEvent(webhookData),
			).rejects.toThrow('Unsupported event: maintenance.invalid');
		});
	});

	describe('getAllProcesses', () => {
		it('should return all processes with related data', async () => {
			const mockProcesses = [mockProcess] as any;
			(prismaService.process.findMany as jest.Mock).mockResolvedValue(
				mockProcesses,
			);

			const result = await service.getAllProcesses();

			expect(prismaService.process.findMany).toHaveBeenCalledWith({
				include: { stages: true, events: true, alerts: true, aiInsights: true },
				orderBy: { createdAt: 'desc' },
			});
			expect(result).toEqual(mockProcesses);
		});
	});

	describe('getProcessById', () => {
		it('should return process by id with related data', async () => {
			const processId = 'test-process-123';
			(prismaService.process.findUnique as jest.Mock).mockResolvedValue(
				mockProcess as any,
			);

			const result = await service.getProcessById(processId);

			expect(prismaService.process.findUnique).toHaveBeenCalledWith({
				where: { id: processId },
				include: { stages: true, events: true, alerts: true, aiInsights: true },
			});
			expect(result).toEqual(mockProcess);
		});

		it('should return null when process not found', async () => {
			const processId = 'non-existent-process';
			(prismaService.process.findUnique as jest.Mock).mockResolvedValue(null);

			const result = await service.getProcessById(processId);

			expect(result).toBeNull();
		});
	});

	describe('processFinancialEvent', () => {
		it('should return null (not implemented)', async () => {
			const result = await service.processFinancialEvent({} as any);

			expect(result).toBeNull();
		});
	});

	describe('processSupplyEvent', () => {
		it('should return null (not implemented)', async () => {
			const result = await service.processSupplyEvent({} as any);

			expect(result).toBeNull();
		});
	});
});
