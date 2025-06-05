import express from "express";
import TextRoutes from "../modules/text/Text.routes.js";
import UserRoutes from "../modules/users/Users.routes.js";

const router = express.Router();

router.use("/auth", UserRoutes);
router.use("/analyzer", TextRoutes);

export default router;
