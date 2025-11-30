"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";
import { uploadFileAndGetURL, makeStoragePath } from "@/lib/storage";

export default function FileUploadPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [url, setUrl] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [uploading, setUploading] = React.useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUrl("");
    if (!file) {
      setError("Please choose a file.");
      return;
    }
    try {
      setUploading(true);
      setProgress(0);
      const path = makeStoragePath("user-uploads", file.name);
      const { url } = await uploadFileAndGetURL(
        file,
        path,
        { contentType: file.type },
        setProgress
      );
      setUrl(url);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <UserLayout>
      <section className="py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">File Upload</h1>
          <p className="text-sm text-gray-600">
            Upload files securely to your account.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-700 space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Select file
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            {uploading && (
              <div className="w-full bg-gray-100 rounded-lg h-2 overflow-hidden">
                <div
                  className="h-2 bg-emerald-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {url && (
              <div className="text-sm">
                <span className="text-gray-600">Download URL: </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline break-all"
                >
                  {url}
                </a>
              </div>
            )}
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </section>
    </UserLayout>
  );
}
