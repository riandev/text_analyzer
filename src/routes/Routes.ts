import express from "express";
import UserRoutes from "../modules/users/Users.routes.js";

const router = express.Router();

router.use("/auth", UserRoutes);

export default router;
