import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.use(
  "/uploads/user_photos",
  express.static(__dirname + "/../uploads/user_photos"),
);

export default router;
