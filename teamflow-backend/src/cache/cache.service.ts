import { DEFAULT_TTL } from '@/constants/constants.ts';
import redis from '@/db/redis.ts';

export async function getCached<T>(key: string) : Promise<T | null> {
    const raw = await redis.get(key);
    if (!raw) {
        return null;
    }
    return JSON.parse(raw) as T;
}

export async function setCached<T>(key: string, value: T, ttl: number = DEFAULT_TTL) : Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
}

export async function invalidateCache(key: string) : Promise<void> {
   const stream = redis.scanStream({
        match: key,
        count: 100,
    });
    const keysToDelete: string[] = [];

    for await (const keys of stream) {
        keysToDelete.push(...keys);
    }

    if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
    }
}