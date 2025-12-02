"use client";

import React from "react";
import Link from "next/link";
import UserLayout from "@/components/user/UserLayout";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { makeStoragePath, uploadFileAndGetURL } from "@/lib/storage";
import { ref as sRef, deleteObject } from "firebase/storage";

export default function UserFileUploadPage() {
  return (
    <UserLayout>
      <SectionContent />
    </UserLayout>
  );
}

function SectionContent() {
  const [email, setEmail] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string>("");

  // Upload form state
  const [packages, setPackages] = React.useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = React.useState<boolean>(false);
  const [selectedTxId, setSelectedTxId] = React.useState<string>("");
  const [docTitle, setDocTitle] = React.useState<string>("");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [message, setMessage] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  // List state
  const [listOpen, setListOpen] = React.useState<boolean>(false);
  const [items, setItems] = React.useState<any[]>([]);
  const [listLoading, setListLoading] = React.useState<boolean>(false);
  const [listError, setListError] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [currentName, setCurrentName] = React.useState<string>("Document");

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setEmail(u?.email ?? null);
      setDisplayName(u?.displayName || "");
    });
    return () => unsub();
  }, []);

  // Load user's purchases/packages
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!db || !email) return;
      try {
        setPackagesLoading(true);
        const colTx = collection(db, "Transactions");
        const qTx = query(
          colTx,
          where("email", "==", (email || "").toLowerCase())
        );
        const snap = await getDocs(qTx);
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a: any, b: any) => {
          const at =
            a.createdAt?.toMillis?.() ??
            (a.createdAt ? a.createdAt.seconds * 1000 : 0);
          const bt =
            b.createdAt?.toMillis?.() ??
            (b.createdAt ? b.createdAt.seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setPackages(list);
      } catch {
        if (!cancelled) setPackages([]);
      } finally {
        if (!cancelled) setPackagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const loadUploads = React.useCallback(async () => {
    if (!db || !email) return;
    try {
      setListLoading(true);
      setListError("");
      const col = collection(db, "UserUploads");
      const q1 = query(
        col,
        where("userEmail", "==", (email || "").toLowerCase())
      );
      const snap = await getDocs(q1);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      list.sort((a: any, b: any) => {
        const at =
          a.uploadTime?.toMillis?.() ??
          (a.uploadTime ? a.uploadTime.seconds * 1000 : 0);
        const bt =
          b.uploadTime?.toMillis?.() ??
          (b.uploadTime ? b.uploadTime.seconds * 1000 : 0);
        return bt - at;
      });
      setItems(list);
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : "Failed to load uploads");
    } finally {
      setListLoading(false);
    }
  }, [db, email]);

  React.useEffect(() => {
    if (listOpen) loadUploads();
  }, [listOpen, loadUploads]);

  const formatDateTime = (ts: any) => {
    if (!ts) return "—";
    const ms = ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  const getDocName = (it: any): string => {
    if (it.filePath)
      return (it.filePath as string).split("/").pop() || "Document";
    if (it.fileUrl) {
      try {
        const u = new URL(it.fileUrl);
        const path = decodeURIComponent(u.pathname);
        return path.split("/").pop() || "Document";
      } catch {
        return decodeURIComponent(
          (it.fileUrl as string).split("?")[0].split("/").pop() || "Document"
        );
      }
    }
    return "Document";
  };

  const handleView = (it: any) => {
    if (!it.fileUrl) return;
    setCurrentUrl(it.fileUrl);
    setCurrentName(it.title || getDocName(it));
    setViewerOpen(true);
  };

  const handleDelete = async (it: any) => {
    try {
      if (!db || !storage) throw new Error("Firebase not initialized");
      const ok = window.confirm("Are you sure you want to delete this upload?");
      if (!ok) return;
      if (it.filePath) {
        const r = sRef(storage, it.filePath);
        await deleteObject(r);
      } else if (it.fileUrl) {
        try {
          const r = sRef(storage, it.fileUrl);
          await deleteObject(r);
        } catch (_) {}
      }
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "UserUploads", it.id));
      setItems((prev) => prev.filter((x) => x.id !== it.id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete upload");
    }
  };

  const handleUpload = async () => {
    try {
      setMessage("");
      setError("");
      if (!db) throw new Error("Firestore not initialized");
      if (!email) throw new Error("Not signed in");
      if (!selectedTxId) throw new Error("Please select a package");
      if (!docTitle.trim()) throw new Error("Please enter a document title");
      if (!file) throw new Error("Please choose a file");
      const tx = packages.find((p) => p.id === selectedTxId) || {};
      const pkgName = (tx.packageName || tx.packageTitle || "").toString();
      const country = (tx.country || "").toString();
      const path = makeStoragePath("user-uploads", file.name);
      setUploading(true);
      setProgress(0);
      const { url, path: savedPath } = await uploadFileAndGetURL(
        file,
        path,
        undefined,
        (pct) => setProgress(pct)
      );
      await addDoc(collection(db, "UserUploads"), {
        userName: displayName || "",
        title: docTitle.trim(),
        fileUrl: url,
        packageName: pkgName,
        country,
        uploadTime: serverTimestamp(),
        userEmail: (email || "").toLowerCase(),
        filePath: savedPath,
      });
      setMessage("File uploaded successfully");
      setDocTitle("");
      setFile(null);
      setSelectedTxId("");
      setProgress(0);
      setUploading(false);
      if (listOpen) loadUploads();
    } catch (e: unknown) {
      setUploading(false);
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">File Upload</h1>
          <Link
            href="/user/dashboard/file-upload/list"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-100"
          >
            List of Uploads
          </Link>
        </div>
        <p className="text-gray-600 mb-4">
          Upload documents for your purchased packages.
        </p>

        {listOpen && (
          <div className="mb-8 overflow-x-auto bg-white rounded-2xl shadow ring-1 ring-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Sl
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Package Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Upload Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-gray-600">
                      Loading…
                    </td>
                  </tr>
                ) : listError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-rose-600">
                      {listError}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-gray-600">
                      No uploads yet.
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {it.title || getDocName(it)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {it.packageName || ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {it.country || ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(it.uploadTime)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {it.fileUrl ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleView(it)}
                              className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(it)}
                              className="px-2 py-1 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDelete(it)}
                            className="px-2 py-1 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchased Package
            </label>
            <select
              value={selectedTxId}
              onChange={(e) => setSelectedTxId(e.target.value)}
              disabled={packagesLoading || uploading}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white disabled:opacity-60"
            >
              <option value="">
                {packages.length ? "Select a package" : "No packages found"}
              </option>
              {packages.map((t) => {
                const label = `${(
                  t.packageName ||
                  t.packageTitle ||
                  "Unnamed Package"
                ).toString()}${t.country ? ` — ${t.country}` : ""}`;
                return (
                  <option key={t.id} value={t.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Title
            </label>
            <input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g., Passport Scan"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
              accept="image/*,.pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-60"
            />
          </div>
          {uploading && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpload}
              disabled={!selectedTxId || !docTitle.trim() || !file || uploading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload File"}
            </button>
            {message && (
              <span className="text-sm text-emerald-700">{message}</span>
            )}
            {error && <span className="text-sm text-rose-600">{error}</span>}
          </div>
        </div>
        {viewerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4"
            onClick={() => setViewerOpen(false)}
          >
            <div
              className="mt-[10vh] bg-white rounded-2xl shadow-xl w-[80vw] max-w-[1200px] h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 p-3 border-b border-gray-200">
                <div className="min-w-0">
                  <h3
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={currentName}
                  >
                    {currentName}
                  </h3>
                </div>
                <button
                  onClick={() => setViewerOpen(false)}
                  className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50">
                <iframe src={currentUrl} className="w-full h-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
