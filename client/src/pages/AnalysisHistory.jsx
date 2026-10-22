import { useEffect, useState } from "react";
import { Clock3, FileSearch, Trash2 } from "lucide-react";
import AppLayout from "../components/AppLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { deleteAnalysis, getMyAnalyses } from "../services/analysis.service";

export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadAnalyses = async () => {
    try {
      setError("");
      const result = await getMyAnalyses();
      setAnalyses(result.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (analysisId) => {
    try {
      setDeletingId(analysisId);
      await deleteAnalysis(analysisId);
      setAnalyses((prev) => prev.filter((analysis) => analysis.id !== analysisId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete analysis");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold text-slate-900">Analysis History</h1>
      <p className="mt-2 text-slate-600">
        Review past analysis results and remove older analysis runs.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingSpinner message="Loading analysis history..." />
        </div>
      ) : analyses.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          No analysis records yet. Run an analysis from Analyze.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-200">
            {analyses.map((analysis) => (
              <li
                key={analysis.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-indigo-600" />
                    <p className="truncate font-semibold text-slate-900">
                      Score: {analysis.score}%
                    </p>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {analysis.resume?.title || "Resume"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {analysis.summary}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(analysis.createdAt).toLocaleString()}
                    </span>
                    <span>Keyword coverage: {analysis.keywordCoverage}%</span>
                    {analysis.targetRole && <span>Role: {analysis.targetRole}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(analysis.id)}
                    disabled={deletingId === analysis.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === analysis.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppLayout>
  );
}
