import { Request, Response, NextFunction } from 'express';
import { Role } from '@/generated/prisma/client.ts';
import { AppError } from './error.middleware.ts';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Chưa xác thực', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Không có quyền thực hiện hành động này', 403));
    }

    next();
  };
}