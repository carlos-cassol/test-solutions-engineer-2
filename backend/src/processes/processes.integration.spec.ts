import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../AI/ai.service';
import { EventService } from '../event/event.service';
import { MaintenanceWebhook } from '../webhooks/dto/maintenance-status.dto';
import {
	MaintenanceStatus,
	MaintenanceType,
} from '../webhooks/enums/webhooks.enums';

describe('ProcessesService Integration', () => {
	let app: INestApplication;
	let processesService: ProcessesService;
	let prismaService: PrismaService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				ProcessesService,
				PrismaService,
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockReturnValue('test-api-key'),
					},
				},
				{
					provide: AiService,
					useValue: {
						executeAI: jest.fn(),
					},
				},
				{
					provide: EventService,
					useValue: {
						logEvent: jest.fn(),
					},
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		processesService = moduleFixture.get<ProcessesService>(ProcessesService);
		prismaService = moduleFixture.get<PrismaService>(PrismaService);
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		// Clean up database before each test
		await prismaService.processEvent.deleteMany();
		await prismaService.aIInsight.deleteMany();
		await prismaService.alerts.deleteMany();
		await prismaService.processStage.deleteMany();
		await prismaService.process.deleteMany();
	});

	describe('Process Lifecycle Integration', () => {
		const testProcessId = 'integration-test-process-123';
		const testVehicleId = 'INT123';

		it('should create and progress through all RIDEC stages', async () => {
			// Stage 1: Receive (R)
			const createdWebhook: MaintenanceWebhook = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(createdWebhook);

			let process = await processesService.getProcessById(testProcessId);
			expect(process).toBeDefined();
			expect(process?.currentStage).toBe('R');
			expect(process?.status).toBe('ACTIVE');

			// Stage 2: Identify (I)
			const identifiedWebhook: MaintenanceWebhook = {
				event: MaintenanceStatus.IDENTIFIED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(identifiedWebhook);

			process = await processesService.getProcessById(testProcessId);
			expect(process?.currentStage).toBe('I');

			// Stage 3: Decide (D)
			const approvedWebhook: MaintenanceWebhook = {
				event: MaintenanceStatus.APPROVED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(approvedWebhook);

			process = await processesService.getProcessById(testProcessId);
			expect(process?.currentStage).toBe('D');

			// Stage 4: Execute (E)
			const executingWebhook: MaintenanceWebhook = {
				event: MaintenanceStatus.EXECUTING,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(executingWebhook);

			process = await processesService.getProcessById(testProcessId);
			expect(process?.currentStage).toBe('E');

			// Stage 5: Conclude (C)
			const completedWebhook: MaintenanceWebhook = {
				event: MaintenanceStatus.COMPLETED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(completedWebhook);

			process = await processesService.getProcessById(testProcessId);
			expect(process?.currentStage).toBe('C');
			expect(process?.status).toBe('COMPLETED');
		});

		it('should handle SLA calculations correctly', async () => {
			const webhook: MaintenanceWebhook = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(webhook);

			const process = await processesService.getProcessById(testProcessId);
			expect(process).toBeDefined();

			// Check if stages were created with correct SLA values
			const stages = await prismaService.processStage.findMany({
				where: { processId: testProcessId },
			});

			expect(stages).toHaveLength(5); // R, I, D, E, C
			expect(stages.find((s) => s.stageKey === 'R')).toBeDefined();
			expect(stages.find((s) => s.stageKey === 'I')).toBeDefined();
			expect(stages.find((s) => s.stageKey === 'D')).toBeDefined();
			expect(stages.find((s) => s.stageKey === 'E')).toBeDefined();
			expect(stages.find((s) => s.stageKey === 'C')).toBeDefined();
		});

		it('should generate alerts when SLA is exceeded', async () => {
			const webhook: MaintenanceWebhook = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(webhook);

			// Manually update stage to simulate SLA violation
			await prismaService.processStage.updateMany({
				where: {
					processId: testProcessId,
					stageKey: 'R',
				},
				data: {
					startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
				},
			});

			// Trigger SLA check by updating process
			await prismaService.process.update({
				where: { id: testProcessId },
				data: { currentStage: 'I' },
			});

			const alerts = await prismaService.alerts.findMany({
				where: { processId: testProcessId },
			});

			expect(alerts.length).toBeGreaterThan(0);
		});

		it('should handle different maintenance types', async () => {
			const maintenanceTypes = [
				MaintenanceType.PREVENTIVE,
				MaintenanceType.CORRECTIVE,
				MaintenanceType.EMERGENCY,
			];

			for (const maintenanceType of maintenanceTypes) {
				const processId = `${testProcessId}-${maintenanceType}`;
				const webhook: MaintenanceWebhook = {
					event: MaintenanceStatus.CREATED,
					data: {
						processId,
						vehicleId: testVehicleId,
						maintenanceType,
						timestamp: new Date().toISOString(),
					},
				};

				await processesService.processMaintenanceEvent(webhook);

				const process = await processesService.getProcessById(processId);
				expect(process).toBeDefined();
				expect(process?.type).toBe('MAINTENANCE');
				expect(process?.title).toContain(maintenanceType);
			}
		});

		it('should maintain data consistency across operations', async () => {
			const webhook: MaintenanceWebhook = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			await processesService.processMaintenanceEvent(webhook);

			// Verify all related data was created
			const process = await processesService.getProcessById(testProcessId);
			const stages = await prismaService.processStage.findMany({
				where: { processId: testProcessId },
			});
			const events = await prismaService.processEvent.findMany({
				where: { processId: testProcessId },
			});

			expect(process).toBeDefined();
			expect(stages).toHaveLength(5);
			expect(events.length).toBeGreaterThan(0);

			// Verify foreign key relationships
			expect(stages.every((stage) => stage.processId === testProcessId)).toBe(
				true,
			);
			expect(events.every((event) => event.processId === testProcessId)).toBe(
				true,
			);
		});
	});
});
