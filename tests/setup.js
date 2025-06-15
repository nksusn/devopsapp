// Test setup configuration
const { beforeAll, afterAll } = require('@jest/globals');

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

beforeAll(() => {
  // Global test setup
});

afterAll(() => {
  // Global test cleanup
});