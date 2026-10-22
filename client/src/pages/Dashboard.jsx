import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileSearch, History, Upload, FileText } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getMyResumes } from "../services/resume.service";

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const result = await getMyResumes();
        setResumes(result.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, []);

  const latestResume = useMemo(() => resumes[0], [resumes]);

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-2 text-slate-600">
          Manage uploads, track resume versions, and prepare for analysis.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            to="/analyze"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <Upload className="h-6 w-6 text-indigo-600" />
            <p className="mt-3 font-semibold">Upload Resume</p>
            <p className="mt-1 text-sm text-slate-600">
              Add new resume versions
            </p>
          </Link>
          <Link
            to="/analyze"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <FileSearch className="h-6 w-6 text-indigo-600" />
            <p className="mt-3 font-semibold">Analyze Resume</p>
            <p className="mt-1 text-sm text-slate-600">Start analysis workflow</p>
          </Link>
          <Link
            to="/history"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <History className="h-6 w-6 text-indigo-600" />
            <p className="mt-3 font-semibold">View History</p>
            <p className="mt-1 text-sm text-slate-600">See all uploaded resumes</p>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total resumes</p>
            {loading ? (
              <div className="mt-3">
                <LoadingSpinner message="Counting uploads..." />
              </div>
            ) : (
              <p className="mt-2 text-3xl font-bold text-slate-900">{resumes.length}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Latest upload</p>
            {loading ? (
              <div className="mt-3">
                <LoadingSpinner message="Loading latest file..." />
              </div>
            ) : latestResume ? (
              <div className="mt-3 flex items-start gap-3">
                <FileText className="h-5 w-5 text-indigo-600" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {latestResume.title}
                  </p>
                  <p className="truncate text-sm text-slate-600">
                    {latestResume.originalName}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No uploads yet.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
