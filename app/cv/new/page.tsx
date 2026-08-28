"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function NewCVPage() {
  const router = useRouter();
  const { status } = useSession();

  const [title, setTitle] = useState("My CV");
  const [template, setTemplate] = useState("modern");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          template,
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create CV");
        return;
      }

      if (data.cv?.id) {
        router.push(`/cv/edit/${data.cv.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <p>Checking your account...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white">
            Create New CV
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Set a title and select a design template to start editing your resume.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                CV Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer CV"
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            <div>
              <label
                htmlFor="template"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Choose Design Template (8 Options)
              </label>
              <select
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              >
                <option value="modern" className="bg-slate-900 text-white">Modern Accent (Indigo Header)</option>
                <option value="classic" className="bg-slate-900 text-white">Classic Serif (Traditional Corporate)</option>
                <option value="professional" className="bg-slate-900 text-white">Professional (Left Border Accent)</option>
                <option value="minimal" className="bg-slate-900 text-white">Minimal Clean (Whitespace Layout)</option>
                <option value="executive" className="bg-slate-900 text-white">Executive (Navy & Amber Gold Bar)</option>
                <option value="tech" className="bg-slate-900 text-white">Tech / Developer (Code Pills & Monospace)</option>
                <option value="creative" className="bg-slate-900 text-white">Creative Split (Dark Left Sidebar)</option>
                <option value="compact" className="bg-slate-900 text-white">Compact One-Page (Dense Grid)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3.5 shadow-lg shadow-indigo-600/30 transition hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating CV..." : "Create CV & Open Editor"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}