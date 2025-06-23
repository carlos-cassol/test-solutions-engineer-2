module.exports = {
	displayName: 'test-radar-backend',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	moduleNameMapper: {
		'^generated/prisma$': '<rootDir>/generated/prisma/index.js',
	},
	coverageDirectory: './coverage/test-radar-backend',
	testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
	testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.dto.ts',
		'!src/**/*.entity.ts',
		'!src/**/*.enum.ts',
		'!src/**/*.module.ts',
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
