import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { ProcessesService } from '../processes/processes.service';
import { PrismaService } from '../prisma/prisma.service';
import { MaintenanceWebhook } from './dto/maintenance-status.dto';
import { MaintenanceStatus, MaintenanceType } from './enums/webhooks.enums';
import { BadRequestException } from '@nestjs/common';

describe('WebhooksService', () => {
	let service: WebhooksService;

	const mockProcessesService = {
		processMaintenanceEvent: jest.fn(),
	};

	const mockPrismaService = {
		processEvent: jest.fn(),
		aIInsight: jest.fn(),
		alerts: jest.fn(),
		processStage: jest.fn(),
		process: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WebhooksService,
				{
					provide: ProcessesService,
					useValue: mockProcessesService,
				},
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<WebhooksService>(WebhooksService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('handleMaintenanceEvent', () => {
		const mockWebhook: MaintenanceWebhook = {
			event: MaintenanceStatus.CREATED,
			data: {
				processId: 'test-process-123',
				vehicleId: 'ABC123',
				maintenanceType: MaintenanceType.PREVENTIVE,
				timestamp: '2024-01-01T10:00:00Z',
			},
		};

		const mockProcess = {
			id: 'test-process-123',
			title: 'Test Maintenance',
			type: 'MAINTENANCE',
			currentStage: 'R',
			status: 'ACTIVE',
		};

		it('should successfully process maintenance event', async () => {
			mockProcessesService.processMaintenanceEvent.mockResolvedValue(
				mockProcess,
			);

			const result = await service.handleMaintenanceEvent(mockWebhook);

			expect(mockProcessesService.processMaintenanceEvent).toHaveBeenCalledWith(
				mockWebhook,
			);
			expect(result).toEqual(mockProcess);
		});

		it('should throw BadRequestException when processing fails', async () => {
			const errorMessage = 'Database connection failed';
			mockProcessesService.processMaintenanceEvent.mockRejectedValue(
				new Error(errorMessage),
			);

			await expect(service.handleMaintenanceEvent(mockWebhook)).rejects.toThrow(
				BadRequestException,
			);

			expect(mockProcessesService.processMaintenanceEvent).toHaveBeenCalledWith(
				mockWebhook,
			);
		});

		it('should handle different maintenance types', async () => {
			const testCases = [
				MaintenanceType.PREVENTIVE,
				MaintenanceType.CORRECTIVE,
				MaintenanceType.EMERGENCY,
			];

			for (const maintenanceType of testCases) {
				const webhook = {
					...mockWebhook,
					data: { ...mockWebhook.data, maintenanceType },
				};

				mockProcessesService.processMaintenanceEvent.mockResolvedValue(
					mockProcess,
				);

				await service.handleMaintenanceEvent(webhook);

				expect(
					mockProcessesService.processMaintenanceEvent,
				).toHaveBeenCalledWith(webhook);
			}
		});

		it('should handle different maintenance events', async () => {
			const testCases = [
				MaintenanceStatus.CREATED,
				MaintenanceStatus.IDENTIFIED,
				MaintenanceStatus.APPROVED,
				MaintenanceStatus.EXECUTING,
				MaintenanceStatus.COMPLETED,
			];

			for (const event of testCases) {
				const webhook = { ...mockWebhook, event };

				mockProcessesService.processMaintenanceEvent.mockResolvedValue(
					mockProcess,
				);

				await service.handleMaintenanceEvent(webhook);

				expect(
					mockProcessesService.processMaintenanceEvent,
				).toHaveBeenCalledWith(webhook);
			}
		});
	});

	describe('handleFinancialEvent', () => {
		it('should throw error (not implemented)', () => {
			expect(() => service.handleFinancialEvent()).toThrow(
				'Method not implemented.',
			);
		});
	});

	describe('handleSupplyEvent', () => {
		it('should throw error (not implemented)', () => {
			expect(() => service.handleSupplyEvent()).toThrow(
				'Method not implemented.',
			);
		});
	});
});
