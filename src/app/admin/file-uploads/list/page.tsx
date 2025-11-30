"use client";

import React from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref as sRef, deleteObject } from "firebase/storage";

interface UploadItem {
  id: string;
  userName?: string | null;
  packageName?: string | null;
  country?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  uploadTime?: Timestamp | null;
  userEmail?: string | null;
  transactionId?: string | null;
}

export default function AdminUploadsListPage() {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [currentName, setCurrentName] = React.useState<string>("");
  const [scale, setScale] = React.useState<number>(1);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db) throw new Error("Firestore not initialized");
        setLoading(true);
        setError("");
        const q = query(
          collection(db, "AdminUploads"),
          orderBy("uploadTime", "desc")
        );
        const snap = await getDocs(q);
        const list: UploadItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        if (!cancelled) setItems(list);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load uploads");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ?? (ts as any)?.seconds
        ? (ts as any).seconds * 1000
        : null;
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  const handleView = (url?: string | null) => {
    if (!url) return;
    setCurrentUrl(url);
    try {
      const u = new URL(url);
      const path = decodeURIComponent(u.pathname);
      const name = path.split("/").pop() || "Document";
      setCurrentName(name);
    } catch {
      const name = decodeURIComponent(
        url.split("?")[0].split("/").pop() || "Document"
      );
      setCurrentName(name);
    }
    setScale(1);
    setViewerOpen(true);
  };

  const handleDelete = async (it: UploadItem) => {
    try {
      if (!db || !storage) throw new Error("Firebase not initialized");
      const ok = window.confirm("Are you sure you want to delete this upload?");
      if (!ok) return;

      // Delete from Storage
      if (it.filePath) {
        const r = sRef(storage, it.filePath);
        await deleteObject(r);
      } else if (it.fileUrl) {
        try {
          const r = sRef(storage, it.fileUrl);
          await deleteObject(r);
        } catch (_) {
          // ignore if deletion by URL fails (e.g., external bucket)
        }
      }

      // Delete Firestore doc
      await deleteDoc(doc(db, "AdminUploads", it.id));

      // Update local state
      setItems((prev) => prev.filter((x) => x.id !== it.id));
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error
          ? e.message
          : "Failed to delete from Storage/Firestore"
      );
    }
  };

  return (
    <section className="py-8 min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Uploads</h1>
            <p className="text-gray-600">List of all uploaded files.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : error ? (
          <div className="text-rose-600 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow ring-1 ring-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Sl
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    User Name
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
                {items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.userName || ""}
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
                      <div className="inline-flex items-center gap-2">
                        {it.fileUrl ? (
                          <>
                            <button
                              onClick={() => handleView(it.fileUrl)}
                              className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            >
                              View
                            </button>
                            <a
                              href={it.fileUrl}
                              download
                              className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                            >
                              Download
                            </a>
                            <button
                              onClick={() => handleDelete(it)}
                              className="px-2 py-1 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No URL</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No uploads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal viewer */}
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
                    {currentName || "Document"}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setScale((s) =>
                        Math.max(0.25, Number((s - 0.1).toFixed(2)))
                      )
                    }
                    className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
                    aria-label="Zoom out"
                  >
                    −
                  </button>
                  <span className="text-xs text-gray-600 w-12 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() =>
                      setScale((s) => Math.min(3, Number((s + 0.1).toFixed(2))))
                    }
                    className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setViewerOpen(false)}
                    className="ml-2 px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50">
                <div
                  className="w-full h-full"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <iframe src={currentUrl} className="w-full h-[80vh]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
