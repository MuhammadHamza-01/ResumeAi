import { useEffect, useMemo, useState } from "react";
import {
  UploadCloud,
  FileText,
  Target,
  RefreshCw,
  Sparkles,
  BarChart3,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { getMyResumes, uploadResume } from "../services/resume.service";
import { runAnalysis } from "../services/analysis.service";

export default function AnalyzeResume() {
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const recentResumes = useMemo(() => resumes.slice(0, 5), [resumes]);

  const loadResumes = async () => {
    try {
      setError("");
      const result = await getMyResumes();
      setResumes(result.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const executeAnalysis = async ({ resumeId, role }) => {
    const result = await runAnalysis({
      resumeId,
      jobDescription,
      targetRole: role || targetRole,
    });

    setAnalysisResult(result.data);
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please choose a resume file first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("title", title || file.name);
    formData.append("targetRole", targetRole);

    try {
      setIsUploading(true);
      const result = await uploadResume(formData);
      setSuccess(result.message || "Resume uploaded successfully");
      setResumes((prev) => [result.data, ...prev]);
      setSelectedResumeId(result.data.id);

      if (jobDescription.trim().length >= 60) {
        setIsAnalyzing(true);
        await executeAnalysis({ resumeId: result.data.id, role: targetRole });
        setSuccess(
          "Resume uploaded and analyzed successfully. Recommendations are ready below."
        );
      }

      setTitle("");
      setTargetRole("");
      setFile(null);
      const fileInput = document.getElementById("resume-file-input");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedResumeId) {
      setError("Select a resume to analyze");
      return;
    }

    if (jobDescription.trim().length < 60) {
      setError("Job description must be at least 60 characters");
      return;
    }

    try {
      setIsAnalyzing(true);
      await executeAnalysis({ resumeId: selectedResumeId, role: targetRole });
      setSuccess("Analysis completed and saved to history");
    } catch (err) {
      setError(err?.response?.data?.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  return (
    <AppLayout>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Upload Resume</h1>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Upload PDF, DOC, or DOCX files up to 5MB and keep them organized by
            role.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Resume title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Frontend Resume"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Target role
              </label>
              <div className="relative">
                <Target className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Backend Developer"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none ring-indigo-500 focus:ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Resume file
              </label>
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  {jobDescription.trim().length >= 60
                    ? "Upload and Analyze"
                    : "Upload Resume"}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Run Analysis</h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Compare an uploaded resume against a specific job description.
            </p>

            <form onSubmit={handleAnalyze} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Select resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring"
                >
                  <option value="">Choose a resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} - {resume.originalName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Job description
                </label>
                <textarea
                  rows={7}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" /> Analyze Resume
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent Uploads</h2>
          <p className="mt-1 text-sm text-slate-600">
            Latest resumes saved to your account.
          </p>

          {isLoading ? (
            <div className="mt-6">
              <LoadingSpinner message="Loading your resumes..." />
            </div>
          ) : recentResumes.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No resumes uploaded yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentResumes.map((resume) => (
                <li
                  key={resume.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-indigo-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {resume.title}
                      </p>
                      <p className="truncate text-xs text-slate-600">
                        {resume.originalName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {(resume.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-indigo-700 hover:text-indigo-900"
                    >
                      Open
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {analysisResult && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Latest Analysis Result</h2>
          <p className="mt-1 text-sm text-slate-600">{analysisResult.summary}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-600">Overall Score</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {analysisResult.score}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-600">Keyword Coverage</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {analysisResult.keywordCoverage}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-600">Matched Keywords</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {analysisResult.matchedKeywords.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-600">Missing Skills</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {analysisResult.missingSkills.length}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Missing Keywords</h3>
              <p className="mt-2 text-sm text-slate-600">
                {analysisResult.missingKeywords.slice(0, 20).join(", ") ||
                  "None"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Recommendations</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {analysisResult.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
