import { Link } from "react-router-dom";
import { FileSearch, History, Upload } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1> 
        <p className="mt-2 text-slate-600">
          Your dashboard stats will appear here in a later phase. For now, use
          the quick actions below.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            to="/analyze"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <Upload className="h-6 w-6 text-indigo-600" />
            <p className="mt-3 font-semibold">Upload Resume</p>
            <p className="mt-1 text-sm text-slate-600">Coming in Phase 3</p>
          </Link>
          <Link
            to="/analyze"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <FileSearch className="h-6 w-6 text-indigo-600" />
            <p className="mt-3 font-semibold">Analyze Resume</p>
            <p className="mt-1 text-sm text-slate-600">Coming in Phase 5</p>
          </Link>
          <Link
            to="/history"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
          >
            <History className="h-6 w-6 text-indigo-600" />
            <p className="mt-3 font-semibold">View History</p>
            <p className="mt-1 text-sm text-slate-600">Coming in Phase 7</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
