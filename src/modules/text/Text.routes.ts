import express from "express";
import { verifyAccessToken } from "../../middlewares/shared/jwt_helper.js";
import { protect } from "../../middlewares/shared/protect.js";
import * as TextController from "./Text.controller.js";

const router = express.Router();

router.post(
  "/add",
  verifyAccessToken,
  protect(["user"]),
  TextController.AddText
);
router.get(
  "/all",
  verifyAccessToken,
  protect(["user"]),
  TextController.GetMyTextAnalysis
);
router.get(
  "/one/:id",
  verifyAccessToken,
  protect(["user"]),
  TextController.GetOneAnalysis
);
router.delete(
  "/delete/:id",
  verifyAccessToken,
  protect(["user"]),
  TextController.DeleteOneAnalysis
);

// Public Routes

router.post("/word-count", TextController.getWordCount);
router.post("/character-count", TextController.getCharacterCount);
router.post("/sentence-count", TextController.getSentenceCount);
router.post("/paragraph-count", TextController.getParagraphCount);
router.post("/longest-words", TextController.getLongestWords);
router.post("/complete", TextController.getCompleteAnalysis);

export default router;
