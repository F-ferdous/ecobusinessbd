"use client";

import React from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

interface UploadItem {
  id: string;
  userName?: string | null;
  packageName?: string | null;
  country?: string | null;
  title?: string | null;
  fileUrl?: string | null;
  uploadTime?: Timestamp | null;
  userEmail?: string | null;
}

export default function AdminUserUploadsPage() {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [currentName, setCurrentName] = React.useState<string>("Document");

  const [search, setSearch] = React.useState<string>("");

  const loadUploads = React.useCallback(async () => {
    try {
      if (!db) throw new Error("Firestore not initialized");
      setLoading(true);
      setError("");
      const col = collection(db, "UserUploads");

      // Try filter by name via where if provided; otherwise fetch all then filter client-side
      let list: UploadItem[] = [];
      if (search.trim()) {
        try {
          const q1 = query(col, where("userName", "==", search.trim()));
          const snap = await getDocs(q1);
          list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        } catch (_) {
          // fallback to client-side filter
          const snap = await getDocs(col);
          list = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) }))
            .filter((x: any) =>
              (x.userName || "")
                .toLowerCase()
                .includes(search.trim().toLowerCase())
            );
        }
      } else {
        const snap = await getDocs(col);
        list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      }

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
      setError(e instanceof Error ? e.message : "Failed to load uploads");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    let c = false;
    (async () => {
      if (c) return;
      await loadUploads();
    })();
    return () => {
      c = true;
    };
  }, [loadUploads]);

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ??
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  const getDocName = (it: UploadItem): string => {
    if (it.fileUrl) {
      try {
        const u = new URL(it.fileUrl);
        const path = decodeURIComponent(u.pathname);
        return path.split("/").pop() || "Document";
      } catch {
        return decodeURIComponent(
          it.fileUrl.split("?")[0].split("/").pop() || "Document"
        );
      }
    }
    return "Document";
  };

  const handleView = (it: UploadItem) => {
    if (!it.fileUrl) return;
    setCurrentUrl(it.fileUrl);
    setCurrentName(it.title || getDocName(it));
    setViewerOpen(true);
  };

  return (
    <section className="py-8 min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Uploads</h1>
            <p className="text-gray-600">Documents uploaded by users.</p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by user name"
            className="w-full max-w-sm rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={loadUploads}
            className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Apply
          </button>
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
                    User name
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Document Title
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
                      {it.title || getDocName(it)}
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
                          <a
                            href={it.fileUrl}
                            download
                            className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No URL</span>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No uploads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
