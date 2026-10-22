import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  deleteAnalysis,
  getAnalysisById,
  getMyAnalyses,
  runAnalysis,
} from "../controllers/analysis.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", runAnalysis);
router.get("/", getMyAnalyses);
router.get("/:id", getAnalysisById);
router.delete("/:id", deleteAnalysis);

export default router;
