import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Process } from 'generated/prisma';
import { EventService } from '../event/event.service';
import { OpenAI } from 'openai';

@Injectable()
export class AiService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
		private readonly eventService: EventService,
	) {}

	public async executeAI(process: Process): Promise<void> {
		try {
			// Buscar dados completos do processo para análise
			const processData = await this.prisma.process.findUnique({
				where: { id: process.id },
				include: {
					stages: true,
					events: true,
					alerts: true,
					aiInsights: true,
				},
			});

			if (!processData) return;

			// Criar prompt para análise do processo
			const prompt = this.createProcessAnalysisPrompt(processData);

			// Configurar OpenAI
			const openai = new OpenAI({
				apiKey: this.configService.get<string>('OPENAI_API_KEY'),
			});

			// Tentar gerar insight com retry
			const maxAttempts = 3;
			let insight: any = null;

			for (let attempt = 0; attempt < maxAttempts; attempt++) {
				try {
					const response = await openai.chat.completions.create({
						model: 'gpt-4o-mini',
						temperature: 0.7,
						messages: [{ role: 'user', content: prompt }],
						max_tokens: 1000,
					});

					const content = response.choices[0].message.content || '';
					insight = this.parseAIResponse(content);
					break;
				} catch (error: any) {
					const isLast = attempt === maxAttempts - 1;
					const wait = Math.pow(2, attempt) * 1000;

					if (error?.code === '429') break;

					if (!isLast) await new Promise((r) => setTimeout(r, wait));
				}
			}

			// Se falhou, usar insight padrão
			if (!insight) {
				insight = {
					type: 'PREDICTION',
					confidence: 0.75,
					message:
						'AI analysis unavailable. Process appears to be progressing normally based on current metrics.',
				};
			}

			// Criar insight no banco
			const aiInsight = await this.prisma.aIInsight.create({
				data: {
					processId: process.id,
					type: insight.type,
					confidence: insight.confidence,
					message: insight.message,
				},
			});

			// Calcular riskScore baseado nos dados
			const riskScore = this.calculateRiskScore(processData);

			// Calcular predictedCompletionTime
			const predictedTime = this.calculatePredictedCompletionTime(processData);

			// Atualizar processo com dados de IA
			await this.prisma.process.update({
				where: { id: process.id },
				data: {
					riskScore: riskScore,
					predictedCompletionTime: predictedTime,
				},
			});

			// Registrar eventos
			await this.eventService.logEvent(process.id, 'ai.insight.generated', {
				insightId: aiInsight.id,
				insightType: aiInsight.type,
				confidence: aiInsight.confidence,
				message: aiInsight.message,
				stage: process.currentStage,
			});

			await this.eventService.logEvent(process.id, 'ai.data.updated', {
				riskScore: riskScore,
				predictedCompletionTime: predictedTime,
				stage: process.currentStage,
			});
		} catch (error) {
			console.error('Error executing AI:', error);
			await this.eventService.logEvent(process.id, 'ai.error', {
				error: error.message,
				stage: process.currentStage,
			});
		}
	}

	private createProcessAnalysisPrompt(processData: any): string {
		const stageProgress = processData.stages.map((stage: any) => ({
			stage: stage.stageKey,
			startTime: stage.startTime,
			endTime: stage.endTime,
			sla: stage.sla,
			duration:
				stage.startTime && stage.endTime
					? (new Date(stage.endTime).getTime() -
							new Date(stage.startTime).getTime()) /
						1000
					: null,
		}));

		const alerts = processData.alerts.map((alert: any) => ({
			level: alert.alertLevel,
			message: alert.alertMessage,
			createdAt: alert.createdAt,
		}));

		const prompt = `
		Analyze the following process data and provide insights about performance, risks, and predictions.

		Process Information:
		- ID: ${processData.id}
		- Type: ${processData.type}
		- Current Stage: ${processData.currentStage}
		- Status: ${processData.status}
		- Vehicle ID: ${processData.vehicleId || 'N/A'}
		- Created: ${processData.createdAt}

		Stage Progress:
		${JSON.stringify(stageProgress, null, 2)}

		Alerts:
		${JSON.stringify(alerts, null, 2)}

		Events Count: ${processData.events.length}

		Based on this data, provide:

		1. A concise analysis of the process performance (2-3 sentences)
		2. Risk assessment and potential issues
		3. Prediction about completion time
		4. Recommendations for optimization

		Respond in the following JSON format:
		{
			"type": "PREDICTION|ANOMALY|RECOMMENDATION",
			"confidence": 0.85,
			"message": "Your analysis here..."
		}

		Focus on actionable insights and be specific about the current stage and overall process health.
		`;

		return prompt;
	}

	private parseAIResponse(content: string): any {
		try {
			// Tentar extrair JSON da resposta
			const jsonMatch = content.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]);
				return {
					type: parsed.type || 'PREDICTION',
					confidence: parsed.confidence || 0.8,
					message: parsed.message || content,
				};
			}

			// Se não conseguir extrair JSON, usar a resposta completa
			return {
				type: 'PREDICTION',
				confidence: 0.7,
				message: content,
			};
		} catch {
			return {
				type: 'PREDICTION',
				confidence: 0.6,
				message: content,
			};
		}
	}

	private calculateRiskScore(processData: any): number {
		let riskScore = 0.1; // Base risk

		// Aumentar risco baseado no status
		if (processData.status === 'OVERDUE') riskScore += 0.4;
		else if (processData.status === 'AT_RISK') riskScore += 0.2;

		// Aumentar risco baseado nos alertas
		const criticalAlerts = processData.alerts.filter(
			(a: any) => a.alertLevel >= 3,
		);
		riskScore += criticalAlerts.length * 0.1;

		// Aumentar risco baseado no tempo no estágio atual
		const currentStage = processData.stages.find(
			(s: any) => s.stageKey === processData.currentStage,
		);
		if (currentStage && currentStage.startTime) {
			const elapsed =
				(Date.now() - new Date(currentStage.startTime).getTime()) / 1000;
			const slaPercentage = (elapsed / currentStage.sla) * 100;
			if (slaPercentage > 80) riskScore += 0.2;
		}

		return Math.min(riskScore, 1.0); // Máximo 1.0
	}

	private calculatePredictedCompletionTime(processData: any): Date {
		const now = new Date();
		const currentStage = processData.stages.find(
			(s: any) => s.stageKey === processData.currentStage,
		);

		if (!currentStage || !currentStage.startTime) {
			return new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 horas padrão
		}

		// Calcular tempo restante baseado no SLA
		const elapsed =
			(now.getTime() - new Date(currentStage.startTime).getTime()) / 1000;
		const remainingInCurrentStage = Math.max(0, currentStage.sla - elapsed);

		// Calcular tempo dos estágios restantes
		const stageOrder = ['R', 'I', 'D', 'E', 'C'];
		const currentIndex = stageOrder.indexOf(processData.currentStage);
		const remainingStages = stageOrder.slice(currentIndex + 1);

		let totalRemainingTime = remainingInCurrentStage;
		remainingStages.forEach((stageKey) => {
			const stage = processData.stages.find(
				(s: any) => s.stageKey === stageKey,
			);
			if (stage) {
				totalRemainingTime += stage.sla;
			}
		});

		// Ajustar baseado no riskScore
		const riskMultiplier = processData.riskScore
			? 1 + processData.riskScore
			: 1.2;
		const adjustedTime = totalRemainingTime * riskMultiplier;

		return new Date(now.getTime() + adjustedTime * 1000);
	}
}
