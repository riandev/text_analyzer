import { cyan } from "console-log-colors";
import dotenv from "dotenv";
import { createClient, RedisClientType } from "redis";
dotenv.config();

const parseRedisUrl = (url: string): { host: string; port: number } => {
  const [host, portStr] = url.split(":");
  return {
    host,
    port: parseInt(portStr, 10),
  };
};

const redisUrl = process.env.REDIS_PUBLIC_URL || "localhost:6379";
const redisDbName = process.env.REDIS_DB_NAME || "";
const { host, port } = parseRedisUrl(redisUrl);

type RedisClient = RedisClientType;

const client: RedisClient = createClient({
  socket: {
    host,
    port,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error("Too many retries");
      }
      return Math.min(retries * 100, 3000);
    },
  },
  database: redisDbName ? parseInt(redisDbName, 10) || 0 : 0,
  password: process.env.REDIS_PASSWORD || undefined,
});

const connectRedis = async (): Promise<void> => {
  try {
    await client.connect();
    console.log(cyan("Redis client connected"));
  } catch (err) {
    console.log(cyan(`Redis client connection error: ${err}`));
  }
};

connectRedis().catch(console.error);

client.on("error", (err) => {
  console.log(cyan(`Redis client error: ${err}`));
});

const socketMap = new Map<string, string>();

export const addSocketId = async (
  userId: string,
  socketId: string
): Promise<void> => {
  try {
    const key = `p_user:${userId}`;
    await client.set(key, socketId);
    socketMap.set(userId, socketId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSocketId = async (userId: string): Promise<string | null> => {
  try {
    const key = `p_user:${userId}`;
    const reply = await client.get(key);
    return reply;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const removeSocketId = async (userId: string): Promise<void> => {
  try {
    await client.del(`p_user:${userId}`);
    socketMap.delete(userId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const storeUserSocket = addSocketId;
export const getUserSocket = getSocketId;
export const removeUserSocket = removeSocketId;

export { client };
export default client;
