// Utility functions

/**
 * Formats a response object
 */
export const formatResponse = (data: unknown, message?: string) => {
  return {
    success: true,
    message: message || 'Success',
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Formats an error response object
 */
export const formatError = (message: string, errors?: unknown) => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Generates a random string
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export * from './image-upload.util';
