import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <p className="text-slate-600">
        Login page — coming in Phase 2.{" "}
        <Link to="/" className="text-indigo-600 hover:underline">
          Back home
        </Link>
      </p>
    </div>
  );
}
