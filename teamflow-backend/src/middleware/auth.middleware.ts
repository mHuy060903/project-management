import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@/generated/prisma/client.ts';
import { env } from '@/config/env.ts';
import { AppError } from './error.middleware.ts';

interface TokenPayload {
  sub: string;
  tenantId: string;
  role: Role;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Thiếu access token', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as TokenPayload;

    req.user = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Access token đã hết hạn', 401));
    }
    return next(new AppError('Access token không hợp lệ', 401));
  }
}