/**
 * Test Helper Functions
 * Utility functions for testing
 */

import { Request, Response } from 'express';

/**
 * Create mock Express request object
 */
export function createMockRequest(options: {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  user?: any;
  cookies?: any;
}): Partial<Request> {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user,
    cookies: options.cookies || {},
    get: jest.fn((name: string) => options.headers?.[name]),
  } as Partial<Request>;
}

/**
 * Create mock Express response object
 */
export function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
}

/**
 * Create mock Next function
 */
export function createMockNext() {
  return jest.fn();
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test-${randomString(8)}@example.com`;
}

/**
 * Generate random phone number
 */
export function randomPhone(): string {
  return `+263${Math.floor(Math.random() * 1000000000)}`;
}

/**
 * Extract error message from error object
 */
export function getErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}
