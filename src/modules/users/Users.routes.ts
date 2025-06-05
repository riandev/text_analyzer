import express from "express";
import { verifyAccessToken } from "../../middlewares/shared/jwt_helper.js";
import { protect } from "../../middlewares/shared/protect.js";
import * as UserController from "./Users.controller.js";

const router = express.Router();

router.post("/register_user", UserController.UserRegister);

router.post("/login", UserController.UserLogin);

router.get(
  "/get_one_user/:id",
  verifyAccessToken,
  protect(["user"]),
  UserController.GetOneUser
);
router.post(
  "/logout",
  verifyAccessToken,
  protect(["user"]),
  UserController.logout
);

router.post("/refresh-token", UserController.refreshToken);

router.delete(
  "/delete_user/:id",
  verifyAccessToken,
  protect(["user"]),
  UserController.DeleteOneUser
);

router.get(
  "/get_user_by_token",
  verifyAccessToken,
  protect(["user"]),
  UserController.GetUserById
);

export default router;
