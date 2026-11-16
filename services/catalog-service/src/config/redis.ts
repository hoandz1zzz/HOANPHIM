import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  },
});

redis.on('connect', () => {
  console.log(`[catalog-service] Redis connected (${REDIS_URL})`);
});

redis.on('error', (err) => {
  console.warn('[catalog-service] Redis error:', err.message);
});

export async function getCachedJson<T>(key: string): Promise<T | null> {
  if (redis.status !== 'ready') {
    return null;
  }

  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.warn(`[Redis GET failed] key=${key}:`, (err as Error).message);
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (redis.status !== 'ready') {
    return;
  }

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.warn(`[Redis SET failed] key=${key}:`, (err as Error).message);
  }
}
