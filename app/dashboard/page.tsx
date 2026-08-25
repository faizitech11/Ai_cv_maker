"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface CV {
  id: string;
  title: string;
  template: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/cv");

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
      callbackUrl: "/login",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Create, manage and edit your professional CVs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/cv/new"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Create New CV
            </Link>

            <Link
              href="/cv/upload"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Upload Existing CV
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-gray-600">
                Loading your CVs...
              </p>
            </div>
          </div>
        ) : cvs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📄
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              No CVs yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              You have not created any CV yet. Create a new CV or
              upload your existing CV to get started.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/cv/new"
                className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Create Your First CV
              </Link>

              <Link
                href="/cv/upload"
                className="inline-flex rounded-lg border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Upload Existing CV
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Your CVs
              </h2>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {cvs.length}{" "}
                {cvs.length === 1 ? "CV" : "CVs"}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="rounded-lg bg-white px-8 py-6 text-center shadow-sm">
                      <div className="text-4xl">📄</div>

                      <p className="mt-2 text-sm font-medium capitalize text-gray-600">
                        {cv.template}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-lg font-bold text-gray-900">
                        {cv.title}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          cv.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {cv.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      Created: {formatDate(cv.createdAt)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Updated: {formatDate(cv.updatedAt)}
                    </p>

                    <div className="mt-5 flex gap-2">
                      <Link
                        href={`/cv/edit/${cv.id}`}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteCV(cv.id)}
                        className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}