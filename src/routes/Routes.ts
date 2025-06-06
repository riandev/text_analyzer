import express from "express";
import { isAuthenticated } from "../middlewares/auth/auth.middleware.js";
import TextRoutes from "../modules/text/Text.routes.js";
import UserRoutes from "../modules/users/Users.routes.js";

const router = express.Router();
const isTestEnvironment = process.env.NODE_ENV === "test";

router.use("/analyzer", TextRoutes);

if (!isTestEnvironment) {
  router.use("/auth/get_one_user", isAuthenticated);
  router.use("/auth/delete_user", isAuthenticated);
  router.use("/auth/logout", isAuthenticated);
}

router.use("/auth", UserRoutes);

export default router;
