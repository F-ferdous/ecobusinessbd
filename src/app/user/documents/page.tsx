"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
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
  const [txItems, setTxItems] = React.useState<any[]>([]);
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

  // Subscribe to user's purchased packages (Transactions) to show as cards
  React.useEffect(() => {
    if (!db || !uid) return;
    const q = query(
      collection(db, "Transactions"),
      where("userId", "==", uid || "")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setTxItems(list);
      },
      () => setTxItems([])
    );
    return () => unsub();
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
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100">
            {/* Controls */}
            <div className="p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {txItems.map((it) => (
                  <Link
                    key={it.id}
                    href={`/user/documents/view?tx=${encodeURIComponent(
                      it.id
                    )}&package=${encodeURIComponent(
                      it.packageTitle || it.packageKey || "Service Package"
                    )}${
                      it.country
                        ? `&country=${encodeURIComponent(it.country)}`
                        : ""
                    }`}
                    className="block rounded-2xl bg-white shadow ring-1 ring-gray-100 hover:shadow-md transition p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Package</div>
                        <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span>
                            {it.packageTitle ||
                              it.packageKey ||
                              "Service Package"}
                          </span>
                        </div>
                      </div>
                      <div />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="inline-flex px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium">
                        Pending
                      </span>
                      {it.country && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {it.country}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {txItems.length === 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
                    No purchased packages yet.
                  </div>
                )}
              </div>
            </div>
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
