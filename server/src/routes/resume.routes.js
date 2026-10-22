import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  deleteResume,
  getMyResumes,
  getResumeById,
  uploadResume,
} from "../controllers/resume.controller.js";
import {
  uploadResume as uploadResumeMiddleware,
  uploadResumeToCloudinary,
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  uploadResumeMiddleware.single("resume"),
  uploadResumeToCloudinary,
  uploadResume
);
router.get("/", getMyResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

export default router;
