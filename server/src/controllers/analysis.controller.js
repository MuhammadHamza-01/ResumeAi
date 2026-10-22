import path from "path";
import Analysis from "../models/Analysis.js";
import Resume from "../models/Resume.js";
import { ApiError } from "../utils/apiError.js";
import {
  analyzeResumeAgainstJob,
  extractResumeText,
} from "../services/resumeAnalysis.service.js";

const formatAnalysis = (analysis) => ({
  id: analysis._id.toString(),
  user: analysis.user.toString(),
  resume: analysis.resume,
  jobDescription: analysis.jobDescription,
  targetRole: analysis.targetRole,
  score: analysis.score,
  keywordCoverage: analysis.keywordCoverage,
  matchedKeywords: analysis.matchedKeywords,
  missingKeywords: analysis.missingKeywords,
  detectedSkills: analysis.detectedSkills,
  missingSkills: analysis.missingSkills,
  recommendations: analysis.recommendations,
  summary: analysis.summary,
  source: analysis.source,
  aiModel: analysis.aiModel,
  createdAt: analysis.createdAt,
  updatedAt: analysis.updatedAt,
});

export const runAnalysis = async (req, res, next) => {
  try {
    const { resumeId, jobDescription, targetRole = "" } = req.body;

    if (!resumeId) {
      throw new ApiError("resumeId is required", 400);
    }

    if (!jobDescription || !jobDescription.trim()) {
      throw new ApiError("jobDescription is required", 400);
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });

    if (!resume) {
      throw new ApiError("Resume not found", 404);
    }

    const absolutePath = path.resolve(
      process.cwd(),
      "uploads",
      "resumes",
      resume.filename
    );

    const resumeText = await extractResumeText(absolutePath, resume.mimeType);

    const analysisResult = await analyzeResumeAgainstJob({
      resumeText,
      jobDescription,
    });

    const analysis = await Analysis.create({
      user: req.user.id,
      resume: resume._id,
      jobDescription: jobDescription.trim(),
      targetRole: targetRole.trim() || resume.targetRole || "",
      ...analysisResult,
    });

    const hydrated = await Analysis.findById(analysis._id).populate(
      "resume",
      "title originalName filename mimeType size targetRole createdAt"
    );

    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: formatAnalysis(hydrated),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id })
      .populate("resume", "title originalName filename")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Analysis history fetched successfully",
      data: analyses.map(formatAnalysis),
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("resume", "title originalName filename mimeType size targetRole");

    if (!analysis) {
      throw new ApiError("Analysis not found", 404);
    }

    res.json({
      success: true,
      message: "Analysis fetched successfully",
      data: formatAnalysis(analysis),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!analysis) {
      throw new ApiError("Analysis not found", 404);
    }

    await Analysis.deleteOne({ _id: analysis._id });

    res.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
