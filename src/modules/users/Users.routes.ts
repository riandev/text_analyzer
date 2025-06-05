import express from "express";
import { verifyAccessToken } from "../../middlewares/shared/jwt_helper.js";
import { protect } from "../../middlewares/shared/protect.js";
import {
  DeleteOneUser,
  GetOneUser,
  GetUserById,
  logout,
  refreshToken,
} from "./Users.controller.js";

const router = express.Router();

router.get(
  "/get_one_user/:id",
  verifyAccessToken,
  protect(["admin", "customer", "parlor"]),
  GetOneUser
);
router.post("/logout", verifyAccessToken, protect(["admin", "doctor"]), logout);

router.post("/refresh-token", refreshToken);

router.delete("/delete_user/:id", verifyAccessToken, DeleteOneUser);

router.get("/get_user_by_token", verifyAccessToken, GetUserById);

export default router;
