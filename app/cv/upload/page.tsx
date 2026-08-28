"use client";

import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function UploadCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maxSize = 10 * 1024 * 1024;

  const validateFile = (selectedFile: File) => {
    setError("");
    setMessage("");

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Only PDF, DOCX, JPG, JPEG, PNG and WEBP files are allowed."
      );
      return false;
    }

    if (selectedFile.size <= 0) {
      setError("The selected file is empty.");
      return false;
    }

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10 MB.");
      return false;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }

    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      validateFile(selectedFile);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      validateFile(droppedFile);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a CV file first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to upload CV.");
        return;
      }

      setMessage("CV uploaded successfully! Redirecting...");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch {
      setError("Something went wrong while uploading the CV.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl("");
    setError("");
    setMessage("");
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = file?.type.startsWith("image/");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white">
            Upload Existing CV
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Upload a PDF, DOCX, or Image file to parse and extract your details into the editor.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
              dragging
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-4xl mb-4">
              📄
            </div>

            <h2 className="text-xl font-bold text-white">
              Drag & Drop your CV file here
            </h2>

            <p className="mt-2 text-xs text-slate-400">or</p>

            <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm px-6 py-3 shadow-lg shadow-indigo-600/30 transition">
              Browse Computer
              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="mt-4 text-xs text-slate-500">
              Supported formats: PDF, DOCX, JPG, JPEG, PNG, WEBP (Max 10 MB)
            </p>
          </div>

          {file && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  {isImage && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="CV preview"
                      className="h-14 w-14 shrink-0 rounded-xl border border-slate-800 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-2xl text-indigo-400">
                      📄
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white text-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={uploading}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              {message}
            </div>
          )}

          <div className="mt-8 flex gap-4 justify-end">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={uploadFile}
              disabled={!file || uploading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading & Extracting..." : "Upload & Parse CV"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
