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
import User from "./Users.model.js";
import { loginSchema, userSchema } from "./Users.validation.js";

dotenv.config();

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
    const data = await User.create(result);
    res.send(data);
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
    const user = await User.findById(userId);
    if (!user) throw createError.NotFound("User not found");

    const role = user.role || "user";

    const accessToken = await signAccessToken(userId, role);
    const refToken = await signRefreshToken(userId, role);
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

export const UserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });
    if (!user) throw createError.NotFound("User not registered");

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch) throw createError.Unauthorized("Username/password not valid");
    await User.updateOne(
      { email: result?.email },
      { $set: { web_token: req.body.web_token } }
    );
    const accessToken = await signAccessToken(user.id, user?.role);
    const refreshToken = await signRefreshToken(user.id, user?.role);

    res.send({
      access_token: accessToken,
      refresh_token: refreshToken,
      role: user?.role,
    });
  } catch (error: any) {
    if (error.isJoi === true)
      return next(createError.BadRequest("Invalid Username/Password"));
    next(error);
  }
};
