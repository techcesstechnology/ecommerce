import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to sanitize request data to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags from strings
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize a string by removing dangerous patterns
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  // Remove script tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  str = str.replace(/javascript:/gi, '');

  // Remove data: protocol for images (potential XSS vector)
  str = str.replace(/data:text\/html/gi, '');

  return str.trim();
}

/**
 * Middleware to prevent NoSQL injection attacks
 * Removes MongoDB operators from query strings
 */
export const preventNoSQLInjection = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = removeMongoOperators(req.body);
  }

  if (req.query) {
    req.query = removeMongoOperators(req.query);
  }

  if (req.params) {
    req.params = removeMongoOperators(req.params);
  }

  next();
};

/**
 * Remove MongoDB operators from an object
 */
function removeMongoOperators(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeMongoOperators(item));
  }

  const cleaned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Remove keys starting with $ (MongoDB operators)
      if (!key.startsWith('$')) {
        cleaned[key] = removeMongoOperators(obj[key]);
      }
    }
  }

  return cleaned;
}
