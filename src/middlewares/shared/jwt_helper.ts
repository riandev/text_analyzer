import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import client from "../../database/init_redis.js";

export interface AuthRequest extends Request {
  payload?: {
    aud: string;
    role: string;
  };
}

export const signAccessToken = (
  userId: string,
  role: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {
      aud: userId,
      role,
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
  let token: string | undefined;

  if (req.headers["authorization"]) {
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    token = bearerToken[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  if (!token) {
    next(createError.Unauthorized("Access token is required"));
    return;
  }

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

export const signRefreshToken = (
  userId: string,
  role: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = {
      aud: userId,
      role,
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
