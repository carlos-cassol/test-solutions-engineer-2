// Configuração global para testes
beforeAll(() => {
	// Configurar variáveis de ambiente para teste
	process.env.NODE_ENV = 'test';
	process.env.DATABASE_URL =
		process.env.TEST_DATABASE_URL ||
		'postgresql://test:test@localhost:5432/test_radar_test';
	process.env.OPENAI_API_KEY = 'test-api-key';
});

afterAll(() => {
	// Cleanup global se necessário
});

// Mock do console para reduzir ruído nos testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
	console.log = jest.fn();
	console.error = jest.fn();
});

afterEach(() => {
	console.log = originalConsoleLog;
	console.error = originalConsoleError;
});

// Configuração global do Jest
global.console = {
	...console,
	log: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};
