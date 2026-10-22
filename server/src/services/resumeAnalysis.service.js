import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { ApiError } from "../utils/apiError.js";

const STOP_WORDS = new Set([
  "about",
  "above",
  "after",
  "again",
  "against",
  "because",
  "before",
  "being",
  "below",
  "between",
  "could",
  "first",
  "from",
  "further",
  "having",
  "into",
  "itself",
  "other",
  "should",
  "their",
  "there",
  "these",
  "those",
  "through",
  "under",
  "until",
  "while",
  "with",
  "would",
  "your",
  "that",
  "this",
  "what",
  "when",
  "where",
  "which",
  "will",
  "have",
  "has",
  "had",
  "were",
  "been",
  "also",
  "than",
  "them",
  "they",
  "then",
  "each",
  "more",
  "most",
  "some",
  "such",
  "only",
  "very",
]);

const IMPORTANT_SKILLS = [
  "javascript",
  "typescript",
  "react",
  "node",
  "express",
  "mongodb",
  "sql",
  "python",
  "java",
  "aws",
  "docker",
  "kubernetes",
  "rest",
  "api",
  "git",
  "testing",
  "communication",
  "leadership",
  "problem solving",
  "agile",
];

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const uniqueStrings = (items = []) =>
  [...new Set(items.map((item) => String(item || "").trim().toLowerCase()))].filter(
    Boolean
  );

const parseJsonFromText = (text) => {
  const raw = String(text || "").trim();
  if (!raw) {
    throw new Error("Empty Gemini response text");
  }

  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
};

const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractTopKeywords = (jobDescription, limit = 30) => {
  const tokens = normalizeText(jobDescription)
    .split(" ")
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));

  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword]) => keyword);
};

const computeRecommendations = ({
  keywordCoverage,
  missingKeywords,
  missingSkills,
  detectedSkills,
}) => {
  const recommendations = [];

  if (keywordCoverage < 45) {
    recommendations.push(
      "Your resume misses many role keywords. Mirror wording from the job description naturally in experience bullets."
    );
  }

  if (missingKeywords.length > 0) {
    recommendations.push(
      `Add evidence for these terms: ${missingKeywords.slice(0, 8).join(", ")}.`
    );
  }

  if (missingSkills.length > 0) {
    recommendations.push(
      `Strengthen technical breadth by including ${missingSkills
        .slice(0, 5)
        .join(", ")} where relevant.`
    );
  }

  if (!detectedSkills.includes("communication")) {
    recommendations.push(
      "Highlight cross-team communication impact and stakeholder collaboration outcomes."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Good baseline alignment. Improve impact by adding measurable outcomes for each key achievement."
    );
  }

  return recommendations;
};

const runHeuristicAnalysis = ({ cleanedResume, cleanedJobDescription }) => {
  const keywords = extractTopKeywords(cleanedJobDescription, 30);
  const matchedKeywords = keywords.filter((keyword) =>
    cleanedResume.includes(keyword)
  );
  const missingKeywords = keywords.filter(
    (keyword) => !cleanedResume.includes(keyword)
  );

  const detectedSkills = IMPORTANT_SKILLS.filter(
    (skill) => cleanedResume.includes(skill) || cleanedJobDescription.includes(skill)
  );
  const missingSkills = IMPORTANT_SKILLS.filter(
    (skill) => cleanedJobDescription.includes(skill) && !cleanedResume.includes(skill)
  );

  const keywordCoverage = keywords.length
    ? Math.round((matchedKeywords.length / keywords.length) * 100)
    : 0;

  const skillCoverageDenominator =
    detectedSkills.length + missingSkills.length || 1;
  const skillCoverage = Math.round(
    (detectedSkills.length / skillCoverageDenominator) * 100
  );

  const score = Math.min(
    100,
    Math.max(0, Math.round(keywordCoverage * 0.75 + skillCoverage * 0.25))
  );

  const recommendations = computeRecommendations({
    keywordCoverage,
    missingKeywords,
    missingSkills,
    detectedSkills,
  });

  let summary = "Strong resume-job alignment.";
  if (score < 40) {
    summary =
      "Low alignment. Add targeted keywords and role-specific achievements to improve ATS match.";
  } else if (score < 70) {
    summary =
      "Moderate alignment. Resume has relevant signals but needs tighter keyword and skill coverage.";
  }

  return {
    score,
    keywordCoverage,
    matchedKeywords,
    missingKeywords,
    detectedSkills,
    missingSkills,
    recommendations,
    summary,
    source: "heuristic",
    aiModel: "",
  };
};

const runGeminiAnalysis = async ({
  resumeText,
  jobDescription,
  cleanedResume,
  cleanedJobDescription,
}) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const heuristicPreview = runHeuristicAnalysis({
    cleanedResume,
    cleanedJobDescription,
  });

  const prompt = `You are an ATS resume analysis system. Compare the resume and job description and return ONLY valid JSON with this exact shape:\n{\n  "score": number,\n  "keywordCoverage": number,\n  "matchedKeywords": string[],\n  "missingKeywords": string[],\n  "detectedSkills": string[],\n  "missingSkills": string[],\n  "recommendations": string[],\n  "summary": string\n}\n\nRules:\n- score and keywordCoverage must be integers between 0 and 100.\n- Arrays should contain concise lowercase terms where possible.\n- recommendations should have 2 to 5 actionable items.\n- summary should be one short paragraph.\n\nResume text:\n${resumeText.slice(0, 22000)}\n\nJob description:\n${jobDescription.slice(0, 12000)}\n\nHeuristic baseline (you can improve it):\n${JSON.stringify(heuristicPreview)}\n`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const responseText =
    data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") ||
    "";

  const parsed = parseJsonFromText(responseText);

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  const keywordCoverage = Math.max(
    0,
    Math.min(100, Math.round(Number(parsed.keywordCoverage) || 0))
  );

  const matchedKeywords = uniqueStrings(parsed.matchedKeywords).slice(0, 50);
  const missingKeywords = uniqueStrings(parsed.missingKeywords).slice(0, 50);
  const detectedSkills = uniqueStrings(parsed.detectedSkills).slice(0, 40);
  const missingSkills = uniqueStrings(parsed.missingSkills).slice(0, 40);
  const recommendations = uniqueStrings(parsed.recommendations)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .slice(0, 8);
  const summary = String(parsed.summary || "").trim();

  if (!summary) {
    throw new Error("Gemini returned an empty summary");
  }

  return {
    score,
    keywordCoverage,
    matchedKeywords,
    missingKeywords,
    detectedSkills,
    missingSkills,
    recommendations,
    summary,
    source: "gemini",
    aiModel: GEMINI_MODEL,
  };
};

export const extractResumeText = async (filePath, mimeType) => {
  const buffer = await fs.readFile(filePath);

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  if (mimeType === "application/msword") {
    throw new ApiError(
      "DOC format parsing is limited. Please upload PDF or DOCX for analysis.",
      400
    );
  }

  throw new ApiError("Unsupported resume type for analysis", 400);
};

export const analyzeResumeAgainstJob = async ({ resumeText, jobDescription }) => {
  const cleanedResume = normalizeText(resumeText);
  const cleanedJobDescription = normalizeText(jobDescription);

  if (!cleanedResume || cleanedResume.length < 60) {
    throw new ApiError(
      "Could not extract enough text from resume. Please upload a clearer file.",
      400
    );
  }

  if (!cleanedJobDescription || cleanedJobDescription.length < 60) {
    throw new ApiError(
      "Job description must be at least 60 characters long",
      400
    );
  }

  const heuristicResult = runHeuristicAnalysis({
    cleanedResume,
    cleanedJobDescription,
  });

  try {
    const geminiResult = await runGeminiAnalysis({
      resumeText,
      jobDescription,
      cleanedResume,
      cleanedJobDescription,
    });

    if (geminiResult) {
      return geminiResult;
    }
  } catch (error) {
    console.warn("Gemini analysis failed, using heuristic fallback:", error.message);
    return {
      ...heuristicResult,
      source: "heuristic-fallback",
    };
  }

  return heuristicResult;
};
