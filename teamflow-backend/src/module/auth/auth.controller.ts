import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.ts';
import { RegisterInput, LoginInput, RefreshInput } from './auth.validation.ts';

export async function registerHandler(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err); 
  }
}

export async function loginHandler(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(
  req: Request<{}, {}, RefreshInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}