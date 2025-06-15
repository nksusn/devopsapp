// Simple test to verify test infrastructure works
const { describe, it, expect } = require('@jest/globals');

describe('Basic Tests', () => {
  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBe(true);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });

  it('should test array operations', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});

describe('Environment Tests', () => {
  it('should have test environment set', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have database URL configured', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });
});