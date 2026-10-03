import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileSearch, Sparkles } from "lucide-react";
import api from "../services/api";

const features = [
  "AI Resume Analysis",
  "ATS Compatibility",
  "Skill Gap Detection",
  "Keyword Matching",
  "Actionable Recommendations",
  "Analysis History",
];

export default function Home() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await api.get("/health");
        if (data.success) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch {
        setApiStatus("offline");
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            ResumeAI
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-medium text-indigo-600">
              Analyze your resume. Understand your strengths. Improve your
              chances.
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Build a stronger resume with AI.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Upload your resume, compare it against a job description, and
              discover the skills and improvements that matter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <FileSearch className="h-4 w-4" />
                Analyze My Resume
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              API status:{" "}
              {apiStatus === "checking" && "Checking connection…"}
              {apiStatus === "online" && (
                <span className="text-emerald-600">Connected to backend</span>
              )}
              {apiStatus === "offline" && (
                <span className="text-amber-600">
                  Backend offline — start the server on port 5000
                </span>
              )}
            </p>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold text-slate-900">Features</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
