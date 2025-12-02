"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

interface UploadItem {
  id: string;
  packageName?: string | null;
  country?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  uploadTime?: Timestamp | null;
  title?: string | null;
}

export default function UserDocumentsPage() {
  return (
    <UserLayout>
      <SectionContent />
    </UserLayout>
  );
}

function SectionContent() {
  const [uid, setUid] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [currentName, setCurrentName] = React.useState<string>("Document");
  // Controls
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<
    "date" | "package" | "title" | "country"
  >("date");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      setEmail(u?.email ?? null);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!db || !uid) return;
      try {
        setLoading(true);
        setError("");
        const col = collection(db, "AdminUploads");
        let list: UploadItem[] = [];
        try {
          const q = query(col, where("userId", "==", uid));
          const snap = await getDocs(q);
          list = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              packageName: data.packageName || null,
              country: data.country || null,
              fileUrl: data.downloadURL || data.fileUrl || null,
              filePath: data.storagePath || data.filePath || null,
              uploadTime: data.uploadedAt || data.uploadTime || null,
              title: data.title || null,
            } as UploadItem;
          });
        } catch (e) {
          // fallback: no results
          list = [];
        }
        // sort by uploadTime desc in JS
        list.sort((a: any, b: any) => {
          const at =
            a.uploadTime?.toMillis?.() ??
            (a.uploadTime ? a.uploadTime.seconds * 1000 : 0);
          const bt =
            b.uploadTime?.toMillis?.() ??
            (b.uploadTime ? b.uploadTime.seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setItems(list);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load documents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const formatDateDMY = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ?? (ts as any)?.seconds
        ? (ts as any).seconds * 1000
        : null;
    if (!ms) return "—";
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getDocName = (it: UploadItem): string => {
    if (it.filePath) return it.filePath.split("/").pop() || "Document";
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

  const openViewer = (it: UploadItem) => {
    const name = it.title || getDocName(it);
    if (!it.fileUrl) return;
    setCurrentName(name);
    setCurrentUrl(it.fileUrl);
    setViewerOpen(true);
  };

  // Derived processed list
  const processed = React.useMemo(() => {
    const norm = (s: any) => (s ?? "").toString().toLowerCase();
    let list = items;
    if (search.trim()) {
      const q = norm(search.trim());
      list = list.filter(
        (it) =>
          norm(it.packageName).includes(q) ||
          norm(it.title).includes(q) ||
          norm(it.country).includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        const at =
          (a.uploadTime as any)?.toMillis?.() ||
          (a.uploadTime ? (a.uploadTime as any).seconds * 1000 : 0);
        const bt =
          (b.uploadTime as any)?.toMillis?.() ||
          (b.uploadTime ? (b.uploadTime as any).seconds * 1000 : 0);
        cmp = at - bt;
      } else if (sortBy === "package") {
        cmp = (a.packageName || "")
          .toString()
          .localeCompare((b.packageName || "").toString(), undefined, {
            sensitivity: "base",
          });
      } else if (sortBy === "title") {
        cmp = (a.title || getDocName(a))
          .toString()
          .localeCompare((b.title || getDocName(b)).toString(), undefined, {
            sensitivity: "base",
          });
      } else if (sortBy === "country") {
        cmp = (a.country || "")
          .toString()
          .localeCompare((b.country || "").toString(), undefined, {
            sensitivity: "base",
          });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return { total, totalPages, currentPage, rows: sorted.slice(start, end) };
  }, [items, search, sortBy, sortDir, page, pageSize]);

  // Reset page when controls change
  React.useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDir, pageSize]);

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600">
            Documents uploaded for your purchased packages.
          </p>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : error ? (
          <div className="text-rose-600 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow ring-1 ring-gray-100">
            {/* Controls */}
            <div className="p-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 border-b border-gray-100">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Search</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Search by package, title, or country"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm flex-1"
                  >
                    <option value="date">Upload Date</option>
                    <option value="package">Package</option>
                    <option value="title">Title</option>
                    <option value="country">Country</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    title={`Sort ${
                      sortDir === "asc" ? "ascending" : "descending"
                    }`}
                  >
                    {sortDir === "asc" ? "Asc" : "Desc"}
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">
                  Rows per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Sl
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Package name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Country
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
                {processed.rows.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(processed.currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.packageName || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.country || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.title || getDocName(it)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateDMY(it.uploadTime)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {it.fileUrl ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openViewer(it)}
                            className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          >
                            View
                          </button>
                          <a
                            href={it.fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
                {processed.total === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No documents yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {processed.total > 0 && (
              <div className="flex items-center justify-between gap-3 p-3 border-t border-gray-100 text-sm">
                <div className="text-gray-600">
                  Page {processed.currentPage} of {processed.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={processed.currentPage <= 1}
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 disabled:opacity-50"
                    onClick={() =>
                      setPage((p) => Math.min(processed.totalPages, p + 1))
                    }
                    disabled={processed.currentPage >= processed.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
                <h3
                  className="text-sm font-semibold text-gray-900 truncate"
                  title={currentName}
                >
                  {currentName}
                </h3>
                <button
                  onClick={() => setViewerOpen(false)}
                  className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              <div className="flex-1">
                <iframe src={currentUrl} className="w-full h-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
