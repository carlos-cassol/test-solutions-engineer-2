import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
	MaintenanceStatus,
	MaintenanceType,
} from '../src/webhooks/enums/webhooks.enums';

describe('Webhooks (e2e)', () => {
	let app: INestApplication;
	let prismaService: PrismaService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

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

	describe('/webhooks/maintenance (POST)', () => {
		const testProcessId = 'e2e-test-process-123';
		const testVehicleId = 'E2E123';

		it('should create new maintenance process', () => {
			const webhookPayload = {
				event: MaintenanceStatus.CREATED,
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			return request(app.getHttpServer())
				.post('/webhooks/maintenance')
				.send(webhookPayload)
				.expect(201)
				.expect((res) => {
					expect(res.body).toHaveProperty('id', testProcessId);
					expect(res.body).toHaveProperty('type', 'MAINTENANCE');
					expect(res.body).toHaveProperty('currentStage', 'R');
					expect(res.body).toHaveProperty('status', 'ACTIVE');
					expect(res.body).toHaveProperty('vehicleId', testVehicleId);
				});
		});

		it('should progress process through RIDEC stages', async () => {
			const stages = [
				{ event: MaintenanceStatus.CREATED, expectedStage: 'R' },
				{ event: MaintenanceStatus.IDENTIFIED, expectedStage: 'I' },
				{ event: MaintenanceStatus.APPROVED, expectedStage: 'D' },
				{ event: MaintenanceStatus.EXECUTING, expectedStage: 'E' },
				{ event: MaintenanceStatus.COMPLETED, expectedStage: 'C' },
			];

			for (const stage of stages) {
				const webhookPayload = {
					event: stage.event,
					data: {
						processId: testProcessId,
						vehicleId: testVehicleId,
						maintenanceType: MaintenanceType.PREVENTIVE,
						timestamp: new Date().toISOString(),
					},
				};

				await request(app.getHttpServer())
					.post('/webhooks/maintenance')
					.send(webhookPayload)
					.expect(201)
					.expect((res) => {
						expect(res.body).toHaveProperty(
							'currentStage',
							stage.expectedStage,
						);
					});
			}

			// Verify final status
			const finalProcess = await prismaService.process.findUnique({
				where: { id: testProcessId },
			});
			expect(finalProcess?.status).toBe('COMPLETED');
		});

		it('should handle different maintenance types', () => {
			const maintenanceTypes = [
				MaintenanceType.PREVENTIVE,
				MaintenanceType.CORRECTIVE,
				MaintenanceType.EMERGENCY,
			];

			const promises = maintenanceTypes.map((maintenanceType) => {
				const processId = `${testProcessId}-${maintenanceType}`;
				const webhookPayload = {
					event: MaintenanceStatus.CREATED,
					data: {
						processId,
						vehicleId: testVehicleId,
						maintenanceType,
						timestamp: new Date().toISOString(),
					},
				};

				return request(app.getHttpServer())
					.post('/webhooks/maintenance')
					.send(webhookPayload)
					.expect(201)
					.expect((res) => {
						expect(res.body).toHaveProperty('type', 'MAINTENANCE');
						expect(res.body.title).toContain(maintenanceType);
					});
			});

			return Promise.all(promises);
		});

		it('should return 400 for invalid webhook payload', () => {
			const invalidPayload = {
				event: 'invalid.event',
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					// Missing required fields
				},
			};

			return request(app.getHttpServer())
				.post('/webhooks/maintenance')
				.send(invalidPayload)
				.expect(400);
		});

		it('should return 400 for unsupported event', () => {
			const webhookPayload = {
				event: 'maintenance.invalid',
				data: {
					processId: testProcessId,
					vehicleId: testVehicleId,
					maintenanceType: MaintenanceType.PREVENTIVE,
					timestamp: new Date().toISOString(),
				},
			};

			return request(app.getHttpServer())
				.post('/webhooks/maintenance')
				.send(webhookPayload)
				.expect(400);
		});
	});

	describe('/webhooks/financial (POST)', () => {
		it('should return 501 for unimplemented endpoint', () => {
			return request(app.getHttpServer())
				.post('/webhooks/financial')
				.send({})
				.expect(501);
		});
	});

	describe('/webhooks/supply (POST)', () => {
		it('should return 501 for unimplemented endpoint', () => {
			return request(app.getHttpServer())
				.post('/webhooks/supply')
				.send({})
				.expect(501);
		});
	});
});
