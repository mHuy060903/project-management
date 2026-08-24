import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '@/db/redis.ts';

export const loginRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(args[0], args.slice(1)) as any,
  }),
  windowMs: 15 * 60 * 1000,
  max: 10, 
  message: { error: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau' },
  standardHeaders: true,
  legacyHeaders: false,
});