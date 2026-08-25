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

      setMessage("CV uploaded successfully.");

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
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Upload Existing CV
          </h1>

          <p className="mt-2 text-gray-600">
            Upload your existing CV and prepare it for editing.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
              dragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
              📄
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Drag & Drop your CV here
            </h2>

            <p className="mt-2 text-gray-500">or</p>

            <label className="mt-4 inline-flex cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
              Browse Files

              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="mt-4 text-sm text-gray-500">
              Supported formats: PDF, DOCX, JPG, JPEG, PNG, WEBP
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 10 MB
            </p>
          </div>

          {file && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  {isImage && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="CV preview"
                      className="h-14 w-14 shrink-0 rounded-lg border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xl">
                      📄
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {file.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={uploading}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={uploadFile}
              disabled={!file || uploading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload CV"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

