import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Lỗi hệ thống';

  res.status(statusCode).json({ error: message });
}