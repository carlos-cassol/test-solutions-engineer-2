import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventService } from '../event/event.service';
import { Process } from 'generated/prisma';

describe('AiService', () => {
	let service: AiService;

	const mockPrismaService = {
		process: {
			findUnique: jest.fn(),
			update: jest.fn(),
		},
		aIInsight: {
			create: jest.fn(),
		},
	};

	const mockConfigService = {
		get: jest.fn(),
	};

	const mockEventService = {
		logEvent: jest.fn(),
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

	const mockProcessData = {
		...mockProcess,
		stages: [
			{
				stageKey: 'R',
				startTime: new Date('2024-01-01T10:00:00Z'),
				endTime: new Date('2024-01-01T10:30:00Z'),
				sla: 3600,
			},
			{
				stageKey: 'I',
				startTime: new Date('2024-01-01T10:30:00Z'),
				endTime: null,
				sla: 7200,
			},
		],
		events: [
			{
				id: 'event-1',
				eventType: 'webhook.received',
				createdAt: new Date(),
			},
		],
		alerts: [
			{
				id: 'alert-1',
				alertLevel: 2,
				alertMessage: 'SLA approaching limit',
				createdAt: new Date(),
			},
		],
		aiInsights: [],
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AiService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: EventService,
					useValue: mockEventService,
				},
			],
		}).compile();

		service = module.get<AiService>(AiService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('executeAI', () => {
		it('should execute AI analysis successfully', async () => {
			mockPrismaService.process.findUnique.mockResolvedValue(mockProcessData);
			mockConfigService.get.mockReturnValue('test-api-key');
			mockPrismaService.aIInsight.create.mockResolvedValue({
				id: 'insight-1',
				processId: 'test-process-123',
				type: 'PREDICTION',
				confidence: 0.85,
				message: 'Process is progressing well',
			});
			mockPrismaService.process.update.mockResolvedValue(mockProcess);

			// Mock OpenAI (we'll need to mock the actual OpenAI call)
			jest
				.spyOn(service as any, 'createProcessAnalysisPrompt')
				.mockReturnValue('test prompt');
			jest.spyOn(service as any, 'parseAIResponse').mockReturnValue({
				type: 'PREDICTION',
				confidence: 0.85,
				message: 'Process is progressing well',
			});

			await service.executeAI(mockProcess);

			expect(mockPrismaService.process.findUnique).toHaveBeenCalledWith({
				where: { id: 'test-process-123' },
				include: {
					stages: true,
					events: true,
					alerts: true,
					aiInsights: true,
				},
			});

			expect(mockPrismaService.aIInsight.create).toHaveBeenCalledWith({
				data: {
					processId: 'test-process-123',
					type: 'PREDICTION',
					confidence: 0.85,
					message: 'Process is progressing well',
				},
			});

			expect(mockPrismaService.process.update).toHaveBeenCalledWith({
				where: { id: 'test-process-123' },
				data: {
					riskScore: expect.any(Number),
					predictedCompletionTime: expect.any(Date),
				},
			});

			expect(mockEventService.logEvent).toHaveBeenCalledTimes(2);
		});

		it('should handle process not found', async () => {
			mockPrismaService.process.findUnique.mockResolvedValue(null);

			await service.executeAI(mockProcess);

			expect(mockPrismaService.process.findUnique).toHaveBeenCalled();
			expect(mockPrismaService.aIInsight.create).not.toHaveBeenCalled();
		});

		it('should handle AI execution errors gracefully', async () => {
			mockPrismaService.process.findUnique.mockResolvedValue(mockProcessData);
			mockConfigService.get.mockReturnValue('test-api-key');
			mockPrismaService.aIInsight.create.mockRejectedValue(
				new Error('AI Error'),
			);

			await service.executeAI(mockProcess);

			expect(mockEventService.logEvent).toHaveBeenCalledWith(
				'test-process-123',
				'ai.error',
				expect.any(Object),
			);
		});

		it('should use fallback insight when AI fails', async () => {
			mockPrismaService.process.findUnique.mockResolvedValue(mockProcessData);
			mockConfigService.get.mockReturnValue('test-api-key');

			// Mock OpenAI to fail
			jest
				.spyOn(service as any, 'createProcessAnalysisPrompt')
				.mockReturnValue('test prompt');
			jest.spyOn(service as any, 'parseAIResponse').mockReturnValue(null);

			mockPrismaService.aIInsight.create.mockResolvedValue({
				id: 'insight-1',
				processId: 'test-process-123',
				type: 'PREDICTION',
				confidence: 0.75,
				message:
					'AI analysis unavailable. Process appears to be progressing normally based on current metrics.',
			});

			await service.executeAI(mockProcess);

			expect(mockPrismaService.aIInsight.create).toHaveBeenCalledWith({
				data: {
					processId: 'test-process-123',
					type: 'PREDICTION',
					confidence: 0.75,
					message:
						'AI analysis unavailable. Process appears to be progressing normally based on current metrics.',
				},
			});
		});
	});

	describe('calculateRiskScore', () => {
		it('should calculate base risk score', () => {
			const processData = {
				...mockProcessData,
				status: 'ACTIVE',
				alerts: [],
			};

			const riskScore = (service as any).calculateRiskScore(processData);
			expect(riskScore).toBe(0.1);
		});

		it('should increase risk for overdue status', () => {
			const processData = {
				...mockProcessData,
				status: 'OVERDUE',
				alerts: [],
			};

			const riskScore = (service as any).calculateRiskScore(processData);
			expect(riskScore).toBe(0.5);
		});

		it('should increase risk for critical alerts', () => {
			const processData = {
				...mockProcessData,
				status: 'ACTIVE',
				alerts: [{ alertLevel: 3 }, { alertLevel: 4 }],
			};

			const riskScore = (service as any).calculateRiskScore(processData);
			expect(riskScore).toBe(0.3);
		});

		it('should cap risk score at 1.0', () => {
			const processData = {
				...mockProcessData,
				status: 'OVERDUE',
				alerts: Array(10).fill({ alertLevel: 4 }),
			};

			const riskScore = (service as any).calculateRiskScore(processData);
			expect(riskScore).toBe(1.0);
		});
	});

	describe('calculatePredictedCompletionTime', () => {
		it('should calculate predicted completion time', () => {
			const now = new Date('2024-01-01T12:00:00Z');
			jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

			const processData = {
				...mockProcessData,
				currentStage: 'I',
				riskScore: 0.2,
				stages: [
					{
						stageKey: 'I',
						startTime: new Date('2024-01-01T10:00:00Z'),
						endTime: null,
						sla: 7200,
					},
					{
						stageKey: 'D',
						startTime: null,
						endTime: null,
						sla: 3600,
					},
					{
						stageKey: 'E',
						startTime: null,
						endTime: null,
						sla: 10800,
					},
					{
						stageKey: 'C',
						startTime: null,
						endTime: null,
						sla: 1800,
					},
				],
			};

			const predictedTime = (service as any).calculatePredictedCompletionTime(
				processData,
			);
			expect(predictedTime).toBeInstanceOf(Date);
			expect(predictedTime.getTime()).toBeGreaterThan(now.getTime());
		});

		it('should return default time when no current stage', () => {
			const now = new Date('2024-01-01T12:00:00Z');
			jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

			const processData = {
				...mockProcessData,
				currentStage: 'R',
				stages: [],
			};

			const predictedTime = (service as any).calculatePredictedCompletionTime(
				processData,
			);
			expect(predictedTime.getTime()).toBe(now.getTime() + 2 * 60 * 60 * 1000);
		});
	});
});
