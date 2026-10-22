import fs from "fs/promises";
import path from "path";
import Resume from "../models/Resume.js";
import { ApiError } from "../utils/apiError.js";

const formatBytesToMb = (bytes) => Number((bytes / (1024 * 1024)).toFixed(2));

const formatResume = (resume, req) => ({
  id: resume._id.toString(),
  title: resume.title,
  originalName: resume.originalName,
  filename: resume.filename,
  mimeType: resume.mimeType,
  size: resume.size,
  sizeInMb: formatBytesToMb(resume.size),
  targetRole: resume.targetRole,
  fileUrl: `${req.protocol}://${req.get("host")}/uploads/resumes/${resume.filename}`,
  createdAt: resume.createdAt,
  updatedAt: resume.updatedAt,
});

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError("Resume file is required", 400);
    }

    const title = req.body.title?.trim() || req.file.originalname;
    const targetRole = req.body.targetRole?.trim() || "";

    const resume = await Resume.create({
      user: req.user.id,
      title,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      targetRole,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: formatResume(resume, req),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Resumes fetched successfully",
      data: resumes.map((resume) => formatResume(resume, req)),
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

    if (!resume) {
      throw new ApiError("Resume not found", 404);
    }

    res.json({
      success: true,
      message: "Resume fetched successfully",
      data: formatResume(resume, req),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

    if (!resume) {
      throw new ApiError("Resume not found", 404);
    }

    await Resume.deleteOne({ _id: resume._id });

    const absoluteFilePath = path.resolve(
      process.cwd(),
      "uploads",
      "resumes",
      resume.filename
    );

    await fs.unlink(absoluteFilePath).catch(() => {
      // Ignore missing files so users can still clean database records.
    });

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
