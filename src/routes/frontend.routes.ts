import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth/auth.middleware.js";
import {
  processTextAnalysis,
  renderAnalyzerPage,
  renderHistoryPage,
  renderHomePage,
} from "../modules/frontend/Frontend.controller.js";

const router = Router();

router.get("/", renderHomePage);

router.get("/analyzer", isAuthenticated, renderAnalyzerPage);
router.get("/history", isAuthenticated, renderHistoryPage);

router.post("/analyze", isAuthenticated, processTextAnalysis);

export default router;
