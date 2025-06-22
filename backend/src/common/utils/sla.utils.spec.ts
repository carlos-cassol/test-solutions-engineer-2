import {
	calculateSlaPercentage,
	calculateTimeRemaining,
	isSlaAtRisk,
	isSlaOverdue,
} from './sla.utils';

describe('SLA Utils', () => {
	describe('calculateSlaPercentage', () => {
		it('should calculate 0% when no time has elapsed', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T10:00:00Z');

			const percentage = calculateSlaPercentage(startTime, sla, currentTime);
			expect(percentage).toBe(0);
		});

		it('should calculate 50% when half time has elapsed', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T10:30:00Z'); // 30 minutes later

			const percentage = calculateSlaPercentage(startTime, sla, currentTime);
			expect(percentage).toBe(50);
		});

		it('should calculate 100% when SLA time has elapsed', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T11:00:00Z'); // 1 hour later

			const percentage = calculateSlaPercentage(startTime, sla, currentTime);
			expect(percentage).toBe(100);
		});

		it('should calculate over 100% when SLA is exceeded', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T11:30:00Z'); // 1.5 hours later

			const percentage = calculateSlaPercentage(startTime, sla, currentTime);
			expect(percentage).toBe(150);
		});

		it('should handle null startTime', () => {
			const sla = 3600;
			const currentTime = new Date('2024-01-01T10:00:00Z');

			const percentage = calculateSlaPercentage(null, sla, currentTime);
			expect(percentage).toBe(0);
		});
	});

	describe('calculateTimeRemaining', () => {
		it('should calculate remaining time correctly', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T10:30:00Z'); // 30 minutes later

			const remaining = calculateTimeRemaining(startTime, sla, currentTime);
			expect(remaining).toBe(1800); // 30 minutes remaining
		});

		it('should return 0 when SLA is exceeded', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T11:30:00Z'); // 1.5 hours later

			const remaining = calculateTimeRemaining(startTime, sla, currentTime);
			expect(remaining).toBe(0);
		});

		it('should handle null startTime', () => {
			const sla = 3600;
			const currentTime = new Date('2024-01-01T10:00:00Z');

			const remaining = calculateTimeRemaining(null, sla, currentTime);
			expect(remaining).toBe(sla);
		});
	});

	describe('isSlaAtRisk', () => {
		it('should return true when SLA is at 80%', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T10:48:00Z'); // 48 minutes later (80%)

			const atRisk = isSlaAtRisk(startTime, sla, currentTime);
			expect(atRisk).toBe(true);
		});

		it('should return true when SLA is over 80%', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T10:54:00Z'); // 54 minutes later (90%)

			const atRisk = isSlaAtRisk(startTime, sla, currentTime);
			expect(atRisk).toBe(true);
		});

		it('should return false when SLA is under 80%', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T10:30:00Z'); // 30 minutes later (50%)

			const atRisk = isSlaAtRisk(startTime, sla, currentTime);
			expect(atRisk).toBe(false);
		});

		it('should return false when startTime is null', () => {
			const sla = 3600;
			const currentTime = new Date('2024-01-01T10:00:00Z');

			const atRisk = isSlaAtRisk(null, sla, currentTime);
			expect(atRisk).toBe(false);
		});
	});

	describe('isSlaOverdue', () => {
		it('should return true when SLA is exceeded', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T11:30:00Z'); // 1.5 hours later

			const overdue = isSlaOverdue(startTime, sla, currentTime);
			expect(overdue).toBe(true);
		});

		it('should return false when SLA is not exceeded', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T10:30:00Z'); // 30 minutes later

			const overdue = isSlaOverdue(startTime, sla, currentTime);
			expect(overdue).toBe(false);
		});

		it('should return false when exactly at SLA limit', () => {
			const startTime = new Date('2024-01-01T10:00:00Z');
			const sla = 3600; // 1 hour in seconds
			const currentTime = new Date('2024-01-01T11:00:00Z'); // exactly 1 hour later

			const overdue = isSlaOverdue(startTime, sla, currentTime);
			expect(overdue).toBe(false);
		});

		it('should return false when startTime is null', () => {
			const sla = 3600;
			const currentTime = new Date('2024-01-01T10:00:00Z');

			const overdue = isSlaOverdue(null, sla, currentTime);
			expect(overdue).toBe(false);
		});
	});
});
