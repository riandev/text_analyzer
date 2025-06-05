import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import client from "../../database/init_redis.js";
import { toObjectId } from "../../helpers/toObjectId.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../middlewares/shared/jwt_helper.js";
import User, { IUser } from "./Users.model.js";
import { userSchema } from "./Users.validation.js";

dotenv.config();

interface AuthRequest extends Request {
  payload?: {
    aud: string;
    role: string;
  };
  user?: IUser;
  webToken?: string;
}

export const UserRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await userSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(`${result.email} is already been registered`);
    const user = new User(result);
    await user.save();
    res.send({ message: "Successfully Added" });
  } catch (e) {
    next(e);
  }
};

export const GetOneUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    if (id) {
      const data = await User.aggregate([
        {
          $match: {
            $and: [{ _id: toObjectId(id) }],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
          },
        },
      ]);
      res.send(data[0]);
    }
  } catch (e) {
    next(e);
  }
};

export const DeleteOneUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const Query = { _id: id };
    await User.deleteOne(Query);
    res.send({ message: "Deleted Successfully" });
  } catch (e) {
    next(e);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ accessToken: accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    try {
      await (client as any).del(userId);
      res.status(200).send({ message: "Successfully Logout" });
    } catch (err) {
      throw createError.InternalServerError();
    }
  } catch (error) {
    next(error);
  }
};

export const GetUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.payload?.aud;
    if (id) {
      const user = await User.aggregate([
        {
          $match: {
            $and: [{ _id: toObjectId(id) }],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            createdAt: 1,
          },
        },
      ]);
      res.send(user[0]);
    }
  } catch (e) {
    next(e);
  }
};
