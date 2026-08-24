import { env } from "@/config/env.ts";
import { Redis } from "ioredis";


const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on('error', (err: any) => {
  console.error('Redis connection error:', err);
});

export default redis;