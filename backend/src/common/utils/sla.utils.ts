/**
 * Calcula a porcentagem de tempo consumido do SLA
 * @param startTime - Tempo de início do estágio
 * @param sla - Tempo limite do SLA em segundos
 * @param currentTime - Tempo atual
 * @returns Porcentagem de tempo consumido (0-100+)
 */
export function calculateSlaPercentage(
	startTime: Date | null,
	sla: number,
	currentTime: Date = new Date(),
): number {
	if (!startTime) return 0;

	const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000;
	const percentage = (elapsed / sla) * 100;

	return Math.max(0, percentage);
}

/**
 * Calcula o tempo restante do SLA
 * @param startTime - Tempo de início do estágio
 * @param sla - Tempo limite do SLA em segundos
 * @param currentTime - Tempo atual
 * @returns Tempo restante em segundos
 */
export function calculateTimeRemaining(
	startTime: Date | null,
	sla: number,
	currentTime: Date = new Date(),
): number {
	if (!startTime) return sla;

	const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000;
	const remaining = sla - elapsed;

	return Math.max(0, remaining);
}

/**
 * Verifica se o SLA está em risco (>= 80% do tempo consumido)
 * @param startTime - Tempo de início do estágio
 * @param sla - Tempo limite do SLA em segundos
 * @param currentTime - Tempo atual
 * @returns true se o SLA está em risco
 */
export function isSlaAtRisk(
	startTime: Date | null,
	sla: number,
	currentTime: Date = new Date(),
): boolean {
	if (!startTime) return false;

	const percentage = calculateSlaPercentage(startTime, sla, currentTime);
	return percentage >= 80;
}

/**
 * Verifica se o SLA foi excedido (100% do tempo consumido)
 * @param startTime - Tempo de início do estágio
 * @param sla - Tempo limite do SLA em segundos
 * @param currentTime - Tempo atual
 * @returns true se o SLA foi excedido
 */
export function isSlaOverdue(
	startTime: Date | null,
	sla: number,
	currentTime: Date = new Date(),
): boolean {
	if (!startTime) return false;

	const percentage = calculateSlaPercentage(startTime, sla, currentTime);
	return percentage > 100;
}
