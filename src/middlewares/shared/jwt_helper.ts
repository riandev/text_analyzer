import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import client from "../../database/init_redis.js";

interface AuthRequest extends Request {
  payload?: {
    aud: string;
    role: string;
  };
}

export const signAccessToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {
      aud: userId,
    };
    const secret = process.env.ACCESS_TOKEN_SECRET || "";
    const options = {
      expiresIn: "1d",
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      resolve(token as string);
    });
  });
};

export const verifyAccessToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.headers["authorization"]) {
    next(createError.Unauthorized());
    return;
  }
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "", (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      next(createError.Unauthorized(message));
      return;
    }
    req.payload = payload as { aud: string; role: string };
    next();
  });
};

export const signRefreshToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {
      aud: userId,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET || "";
    const options = {
      expiresIn: "1y",
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      try {
        client.set(userId, token as string);
        resolve(token as string);
      } catch (err) {
        console.log((err as Error).message);
        reject(createError.InternalServerError());
      }
    });
  });
};

export const verifyRefreshToken = (refreshToken: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "",
      (err, payload) => {
        if (err) {
          console.log(err.message);
          reject(createError.Unauthorized());
          return;
        }
        const userId = (payload as { aud: string }).aud;
        try {
          const result = client.get(userId) as unknown as string;

          if (refreshToken === result) {
            resolve(userId);
          } else {
            reject(createError.Unauthorized());
          }
        } catch (err) {
          console.log((err as Error).message);
          reject(createError.InternalServerError());
        }
      }
    );
  });
};
