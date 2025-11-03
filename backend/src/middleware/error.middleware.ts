import { Request, Response } from 'express';
import { ApiResponse } from '../types';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response
): void {
  console.error('Error:', err);

  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error',
  };

  res.status(500).json(response);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: 'Route not found',
  };

  res.status(404).json(response);
}
