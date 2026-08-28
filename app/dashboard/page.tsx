"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CV {
  id: string;
  title: string;
  template: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      fetchCVs();
    }
  }, [status, router]);

  const fetchCVs = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/cv");

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load CVs");
      }

      const data = await response.json();

      if (data.success) {
        setCvs(data.cvs || []);
      } else {
        setError(data.message || "Failed to load CVs");
      }
    } catch {
      setError("Unable to load your CVs");
    } finally {
      setLoading(false);
    }
  };

  const deleteCV = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this CV?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/cv/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to delete CV");
        return;
      }

      setCvs((currentCVs) =>
        currentCVs.filter((cv) => cv.id !== id)
      );
    } catch {
      alert("Something went wrong while deleting the CV");
    }
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500" />
          <p>Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              CV
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AI CV Maker
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="hidden sm:inline text-sm text-slate-400">
                Logged in as <strong className="text-slate-200">{session.user.name || session.user.email}</strong>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              My Dashboard
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              Create, edit, and export your professional AI-powered resumes.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/cv/new"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] flex items-center gap-2"
            >
              <span>+ Create New CV</span>
            </Link>

            <Link
              href="/cv/upload"
              className="px-6 py-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 text-slate-200 font-semibold text-sm transition hover:border-slate-700 flex items-center gap-2"
            >
              <span>Upload Existing CV</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500" />
              <p className="text-slate-400 text-sm">Loading your CV documents...</p>
            </div>
          </div>
        ) : cvs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-20 text-center backdrop-blur-sm max-w-2xl mx-auto">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-4xl">
              📄
            </div>

            <h2 className="text-2xl font-bold text-white">
              No CVs Found
            </h2>

            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              You haven't created any CV documents yet. Build your first CV from scratch or upload an existing resume to start optimizing!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/cv/new"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
              >
                Create Your First CV
              </Link>

              <Link
                href="/cv/upload"
                className="px-6 py-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-semibold text-sm transition"
              >
                Upload Resume File
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Your Documents
              </h2>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                {cvs.length} {cvs.length === 1 ? "CV Document" : "CV Documents"}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className="rounded-3xl border border-slate-800/90 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between overflow-hidden group shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {cv.template} template
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          cv.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {cv.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {cv.title}
                    </h3>

                    <div className="mt-4 space-y-1 text-xs text-slate-400">
                      <p>Created: {formatDate(cv.createdAt)}</p>
                      <p>Updated: {formatDate(cv.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex gap-3">
                    <Link
                      href={`/cv/edit/${cv.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-center text-xs transition shadow-md shadow-indigo-600/20"
                    >
                      Edit CV
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteCV(cv.id)}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-semibold text-xs transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}