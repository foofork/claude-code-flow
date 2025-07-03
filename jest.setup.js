// Jest setup file for Node.js environment
import { jest } from '@jest/globals';

global.console = {
  ...console,
  // Suppress console output during tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};