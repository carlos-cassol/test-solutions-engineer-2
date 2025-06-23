// Configuração global para testes
beforeAll(() => {
	process.env.NODE_ENV = 'test';
	process.env.DATABASE_URL =
		process.env.TEST_DATABASE_URL ||
		'postgresql://test:test@localhost:5432/test_radar_test';
	process.env.OPENAI_API_KEY = 'test-api-key';
});

afterAll(() => {});

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

global.console = {
	...console,
	log: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};
