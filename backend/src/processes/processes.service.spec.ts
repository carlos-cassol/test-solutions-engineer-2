import { Test, TestingModule } from '@nestjs/testing';
import { ProcessesService } from './processes.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../AI/ai.service';
import { EventService } from '../event/event.service';
import { MaintenanceWebhook } from '../webhooks/dto/maintenance-status.dto';
import { Process } from 'generated/prisma';
import {
	MaintenanceStatus,
	MaintenanceType,
} from '../webhooks/enums/webhooks.enums';

describe('ProcessesService', () => {
	let service: ProcessesService;

	const mockPrismaService = {
		process: {
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		processStage: {
			findFirst: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
		alerts: {
			create: jest.fn(),
		},
	};

	const mockAiService = {
		executeAI: jest.fn(),
	};

	const mockEventService = {
		logEvent: jest.fn(),
	};

	const mockConfigService = {
		get: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProcessesService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: AiService,
					useValue: mockAiService,
				},
				{
					provide: EventService,
					useValue: mockEventService,
				},
			],
		}).compile();

		service = module.get<ProcessesService>(ProcessesService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('processMaintenanceEvent', () => {
		const mockWebhook: MaintenanceWebhook = {
			event: MaintenanceStatus.CREATED,
			data: {
				processId: 'test-process-123',
				vehicleId: 'ABC123',
				maintenanceType: MaintenanceType.PREVENTIVE,
				timestamp: '2024-01-01T10:00:00Z',
			},
		};

		const mockProcess: Process = {
			id: 'test-process-123',
			title: 'Test Maintenance',
			type: 'MAINTENANCE',
			vehicleId: 'ABC123',
			currentStage: 'R',
			status: 'ACTIVE',
			createdAt: new Date(),
			updatedAt: new Date(),
			predictedCompletionTime: null,
			riskScore: null,
		};

		it('should create new process when it does not exist', async () => {
			mockPrismaService.process.findUnique.mockResolvedValue(null);
			mockPrismaService.process.create.mockResolvedValue({
				...mockProcess,
				stages: [],
			});
			mockPrismaService.process.findUnique.mockResolvedValue({
				...mockProcess,
				stages: [],
				events: [],
				alerts: [],
				aiInsights: [],
			});

			await service.processMaintenanceEvent(mockWebhook);

			expect(mockPrismaService.process.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					title: expect.stringContaining('Maintenance preventive'),
					type: 'MAINTENANCE',
					vehicleId: 'ABC123',
					currentStage: 'R',
					status: 'ACTIVE',
				}),
				include: { stages: true },
			});
			expect(mockEventService.logEvent).toHaveBeenCalledWith(
				'test-process-123',
				'webhook.received',
				expect.any(Object),
			);
		});

		it('should use existing process when it exists', async () => {
			mockPrismaService.process.findUnique.mockResolvedValue({
				...mockProcess,
				stages: [],
			});
			mockPrismaService.process.findUnique.mockResolvedValue({
				...mockProcess,
				stages: [],
				events: [],
				alerts: [],
				aiInsights: [],
			});

			await service.processMaintenanceEvent(mockWebhook);

			expect(mockPrismaService.process.create).not.toHaveBeenCalled();
			expect(mockEventService.logEvent).toHaveBeenCalled();
		});

		it('should map events to correct stages', async () => {
			const testCases = [
				{ event: MaintenanceStatus.CREATED, expectedStage: 'R' },
				{ event: MaintenanceStatus.IDENTIFIED, expectedStage: 'I' },
				{ event: MaintenanceStatus.APPROVED, expectedStage: 'D' },
				{ event: MaintenanceStatus.EXECUTING, expectedStage: 'E' },
				{ event: MaintenanceStatus.COMPLETED, expectedStage: 'C' },
			];

			for (const testCase of testCases) {
				mockPrismaService.process.findUnique.mockResolvedValue({
					...mockProcess,
					stages: [],
				});
				mockPrismaService.process.findUnique.mockResolvedValue({
					...mockProcess,
					stages: [],
					events: [],
					alerts: [],
					aiInsights: [],
				});

				const webhook = { ...mockWebhook, event: testCase.event };
				await service.processMaintenanceEvent(webhook);

				expect(mockPrismaService.process.update).toHaveBeenCalledWith({
					where: { id: 'test-process-123' },
					data: { currentStage: testCase.expectedStage },
				});
			}
		});

		it('should throw error for unsupported event', async () => {
			const invalidWebhook = { ...mockWebhook, event: 'invalid.event' as any };

			await expect(
				service.processMaintenanceEvent(invalidWebhook),
			).rejects.toThrow('Unsupported event: invalid.event');
		});
	});

	describe('getProcessById', () => {
		it('should return process with all relations', async () => {
			const mockProcessWithRelations = {
				id: 'test-id',
				title: 'Test Process',
				type: 'MAINTENANCE',
				vehicleId: 'ABC123',
				currentStage: 'R',
				status: 'ACTIVE',
				createdAt: new Date(),
				updatedAt: new Date(),
				predictedCompletionTime: null,
				riskScore: null,
				stages: [],
				events: [],
				alerts: [],
				aiInsights: [],
			};

			mockPrismaService.process.findUnique.mockResolvedValue(
				mockProcessWithRelations,
			);

			const result = await service.getProcessById('test-id');

			expect(mockPrismaService.process.findUnique).toHaveBeenCalledWith({
				where: { id: 'test-id' },
				include: {
					stages: true,
					events: true,
					alerts: true,
					aiInsights: true,
				},
			});
			expect(result).toEqual(mockProcessWithRelations);
		});

		it('should return null when process not found', async () => {
			mockPrismaService.process.findUnique.mockResolvedValue(null);

			const result = await service.getProcessById('non-existent');

			expect(result).toBeNull();
		});
	});

	describe('processFinancialEvent', () => {
		it('should return null (not implemented)', async () => {
			const result = await service.processFinancialEvent({});
			expect(result).toBeNull();
		});
	});

	describe('processSupplyEvent', () => {
		it('should return null (not implemented)', async () => {
			const result = await service.processSupplyEvent({});
			expect(result).toBeNull();
		});
	});
});
