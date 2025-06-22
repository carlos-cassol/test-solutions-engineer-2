module.exports = {
	displayName: 'test-radar-backend',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: './coverage/test-radar-backend',
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
		'<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)',
		'<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)',
	],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.dto.ts',
		'!src/**/*.entity.ts',
		'!src/**/*.enum.ts',
		'!src/**/*.module.ts',
		'!src/main.ts',
		'!src/**/index.ts',
	],
	coverageReporters: ['text', 'lcov', 'html'],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
	setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
	testTimeout: 30000,
};
