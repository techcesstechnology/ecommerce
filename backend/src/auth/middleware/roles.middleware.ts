import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../config/auth.config';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

/**
 * Role-based authorization middleware factory
 * Checks if authenticated user has required role(s)
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      });

      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    logger.info('Role authorization successful', {
      userId: req.user.userId,
      role: req.user.role,
    });

    next();
  };
};

/**
 * Check if user is admin
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Check if user is manager or admin
 */
export const requireManagerOrAdmin = requireRole(UserRole.MANAGER, UserRole.ADMIN);

/**
 * Check if user is driver
 */
export const requireDriver = requireRole(UserRole.DRIVER);

/**
 * Check if user is customer
 */
export const requireCustomer = requireRole(UserRole.CUSTOMER);

/**
 * Permission-based middleware factory
 * More granular than role-based authorization
 */
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

// Define role permissions
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  [UserRole.MANAGER]: [
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'delete' },
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
    { resource: 'users', action: 'read' },
  ],
  [UserRole.DRIVER]: [
    { resource: 'deliveries', action: 'read' },
    { resource: 'deliveries', action: 'update' },
    { resource: 'orders', action: 'read' },
  ],
  [UserRole.CUSTOMER]: [
    { resource: 'products', action: 'read' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'read' },
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
  ],
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (userRole: UserRole, resource: string, action: Permission['action']): boolean => {
  const permissions = rolePermissions[userRole];
  
  // Check for wildcard permission
  if (permissions.some((p) => p.resource === '*' && p.action === action)) {
    return true;
  }

  // Check for specific permission
  return permissions.some((p) => p.resource === resource && p.action === action);
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (resource: string, action: Permission['action']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Check if user has required permission
    if (!hasPermission(req.user.role, resource, action)) {
      logger.warn('Unauthorized access attempt - insufficient permissions', {
        userId: req.user.userId,
        userRole: req.user.role,
        resource,
        action,
      });

      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    logger.info('Permission authorization successful', {
      userId: req.user.userId,
      role: req.user.role,
      resource,
      action,
    });

    next();
  };
};
