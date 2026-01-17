import logger from "../utilities/logger.js";

let redisClient;

if (process.env.REDIS_PROVIDER === "upstash") {
  // ✅ Upstash Redis (Production)
  const { Redis } = await import("@upstash/redis");

  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  logger.info("✅ Upstash Redis configured");
} else {
  // ✅ Local Redis (Development)
  const { default: Redis } = await import("ioredis");

  redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  redisClient.on("connect", () => {
    logger.info("✅ Local Redis connected successfully");
  });

  redisClient.on("error", (error) => {
    logger.error("❌ Redis connection failed", { error: error.message });
  });
}

// ✅ GET
export const cacheGet = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error("Redis GET error: ", { key, error });
    return null;
  }
};

// ✅ SET with TTL
export const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const jsonValue = JSON.stringify(value);

    if (process.env.REDIS_PROVIDER === "upstash") {
      await redisClient.set(key, jsonValue, { ex: ttl });
    } else {
      await redisClient.setex(key, ttl, jsonValue);
    }

    return true;
  } catch (error) {
    logger.error("Redis SET error: ", { key, error: error.message });
    return false;
  }
};

// ✅ DEL
export const cacheDel = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error("Redis DEL error: ", { key, error });
    return false;
  }
};

// ✅ DEL Pattern helper (pass keys array)
export const cacheDelPattern = async (keys) => {
  try {
    if (keys?.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    logger.error("Redis DEL PATTERN error: ", { keys, error: error.message });
    return false;
  }
};
