import express from "express";
import apiLimiter from "src/middlewares/shared/rate_limiter.js";
import { cacheMiddleware } from "../../middlewares/shared/cache_middleware.js";
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

// Public Routes with caching

router.post(
  "/word-count",
  apiLimiter,
  cacheMiddleware,
  TextController.getWordCount
);
router.post(
  "/character-count",
  apiLimiter,
  cacheMiddleware,
  TextController.getCharacterCount
);
router.post(
  "/sentence-count",
  apiLimiter,
  cacheMiddleware,
  TextController.getSentenceCount
);
router.post(
  "/paragraph-count",
  apiLimiter,
  cacheMiddleware,
  TextController.getParagraphCount
);
router.post(
  "/longest-words",
  apiLimiter,
  cacheMiddleware,
  TextController.getLongestWords
);
router.post(
  "/complete",
  apiLimiter,
  cacheMiddleware,
  TextController.getCompleteAnalysis
);

export default router;
