import { NextFunction, Request, Response } from "express";
import { client } from "../../database/init_redis.js";
import { logger } from "../../utils/logger.js";

const CACHE_TTL = 3600;

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.method !== "POST" || !req.body.text) {
      return next();
    }

    const cacheKey = `text_analyzer:${req.path}:${Buffer.from(
      req.body.text
    ).toString("base64")}`;
    const cachedResponse = await client.get(cacheKey);

    if (cachedResponse) {
      logger.info(`Cache hit for ${req.path}`);
      return res.json(JSON.parse(cachedResponse));
    }

    const originalJson = res.json;

    res.json = function (body) {
      client
        .setEx(cacheKey, CACHE_TTL, JSON.stringify(body))
        .catch((err) => logger.error(`Error setting cache: ${err}`));

      logger.info(`Cache miss for ${req.path}, storing result`);

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    logger.error(`Cache middleware error: ${error}`);
    next();
  }
};

export const clearCache = async (text: string) => {
  try {
    const pattern = `text_analyzer:*:${Buffer.from(text).toString("base64")}`;
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(keys);
      logger.info(`Cleared ${keys.length} cache entries for text`);
    }
  } catch (error) {
    logger.error(`Error clearing cache: ${error}`);
  }
};
