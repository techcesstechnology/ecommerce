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
 * NOTE: This provides basic protection for API inputs. For HTML content rendering,
 * use a comprehensive library like DOMPurify on the client side.
 * API-only backends should rely on Content-Type: application/json and avoid HTML rendering.
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  // Remove all script tags (including malformed ones with spaces)
  // Multiple passes to handle nested or obfuscated scripts
  let sanitized = str;
  let previousLength = 0;
  while (sanitized.length !== previousLength) {
    previousLength = sanitized.length;
    sanitized = sanitized.replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis, '');
  }

  // Remove all event handlers (comprehensive patterns)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove dangerous protocols (multiple passes for obfuscation)
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');
  sanitized = sanitized.replace(/data\s*:\s*text\s*\/\s*html/gi, '');

  return sanitized.trim();
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
