"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Checking your account...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New CV
          </h1>

          <p className="mt-2 text-gray-600">
            Create a professional CV for your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              CV Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My CV"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="template"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Choose Template
            </label>

            <select
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="professional">Professional</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating CV..." : "Create CV"}
          </button>
        </form>
      </div>
    </main>
  );
}