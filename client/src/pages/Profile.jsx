import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/auth.service";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
    },
  });

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const onSubmit = async (data) => {
    setMessage("");
    setApiError("");

    try {
      const result = await updateProfile({ name: data.name });
      updateUser(result.data);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Could not update profile."
      );
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-slate-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Member since</dt>
              <dd className="mt-1 text-slate-900">{memberSince}</dd>
            </div>
          </dl>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {apiError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiError}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
