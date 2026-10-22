import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    jobDescription: {
      type: String,
      required: true,
      minlength: 30,
      maxlength: 12000,
      trim: true,
    },
    targetRole: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    keywordCoverage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    detectedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ["gemini", "heuristic", "heuristic-fallback"],
      default: "heuristic",
    },
    aiModel: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;
