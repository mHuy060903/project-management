import { Router } from 'express';
import { validate } from '@/middleware/validate.middleware.ts';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation.ts';
import { registerHandler, loginHandler, refreshHandler } from './auth.controller.ts';
import { loginRateLimiter } from '@/middleware/rateLimit.middleware.ts';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', loginRateLimiter, validate(loginSchema), loginHandler);
router.post('/refresh', validate(refreshSchema), refreshHandler);

export default router;