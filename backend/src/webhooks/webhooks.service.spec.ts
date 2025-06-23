import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { ProcessesService } from '../processes/processes.service';
import { MaintenanceWebhook } from './dto/maintenance-status.dto';
import { MaintenanceStatus, MaintenanceType } from './enums/webhooks.enums';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhooksService', () => {
	let service: WebhooksService;
	let processesService: jest.Mocked<ProcessesService>;
	let prismaService: jest.Mocked<PrismaService>;

	beforeEach(async () => {
		const mockProcessesService = {
			processMaintenanceEvent: jest.fn(),
			processFinancialEvent: jest.fn(),
			processSupplyEvent: jest.fn(),
		};
		const mockPrismaService = {};

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
		processesService = module.get(ProcessesService);
		prismaService = module.get(PrismaService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('handleMaintenanceEvent', () => {
		it('should process maintenance webhook successfully', async () => {
			const webhookData: MaintenanceWebhook = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: 'test-process-123',
					vehicleId: 'TEST123',
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			const mockProcess = {
				id: 'test-process-123',
				title: 'Test Maintenance',
				type: 'MAINTENANCE',
				vehicleId: 'TEST123',
				currentStage: 'R',
				status: 'ACTIVE',
			};

			processesService.processMaintenanceEvent.mockResolvedValue(
				mockProcess as any,
			);

			const result = await service.handleMaintenanceEvent(webhookData);

			expect(processesService.processMaintenanceEvent).toHaveBeenCalledWith(
				webhookData,
			);
			expect(result).toEqual(mockProcess);
		});

		it('should handle maintenance webhook processing errors', async () => {
			const webhookData: MaintenanceWebhook = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: 'test-process-123',
					vehicleId: 'TEST123',
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			const error = new Error('Database connection failed');
			processesService.processMaintenanceEvent.mockRejectedValue(error);

			await expect(service.handleMaintenanceEvent(webhookData)).rejects.toThrow(
				'Error processing maintenance event: Database connection failed',
			);
		});

		it('should handle different maintenance events', async () => {
			const events = [
				MaintenanceStatus.CREATED,
				MaintenanceStatus.IDENTIFIED,
				MaintenanceStatus.APPROVED,
				MaintenanceStatus.EXECUTING,
				MaintenanceStatus.COMPLETED,
			];

			const mockProcess = {
				id: 'test-process-123',
				title: 'Test Maintenance',
				type: 'MAINTENANCE',
				vehicleId: 'TEST123',
				currentStage: 'R',
				status: 'ACTIVE',
			};

			processesService.processMaintenanceEvent.mockResolvedValue(
				mockProcess as any,
			);

			for (const event of events) {
				const webhookData: MaintenanceWebhook = {
					event,
					data: {
						processId: 'test-process-123',
						vehicleId: 'TEST123',
						maintenanceType: MaintenanceType.PREVENTIVE,
						timestamp: new Date().toISOString(),
					},
				};

				const result = await service.handleMaintenanceEvent(webhookData);
				expect(result).toEqual(mockProcess);
			}
		});
	});

	describe('handleFinancialEvent', () => {
		it('should throw not implemented error', async () => {
			await expect(service.handleFinancialEvent()).rejects.toThrow(
				'Method not implemented.',
			);
		});
	});

	describe('handleSupplyEvent', () => {
		it('should throw not implemented error', async () => {
			await expect(service.handleSupplyEvent()).rejects.toThrow(
				'Method not implemented.',
			);
		});
	});
});
