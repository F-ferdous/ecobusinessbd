"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  getDoc,
  doc,
} from "firebase/firestore";

type UploadRow = {
  id: string;
  packageName?: string | null;
  country?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  uploadTime?: Timestamp | null;
  title?: string | null;
  transactionId?: string | null;
};

export default function DocumentsViewPage() {
  return (
    <UserLayout>
      <React.Suspense
        fallback={<div className="text-gray-600 p-4">Loading…</div>}
      >
        <Content />
      </React.Suspense>
    </UserLayout>
  );
}

function Content() {
  const params = useSearchParams();
  const [uid, setUid] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<UploadRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [txDetail, setTxDetail] = React.useState<any | null>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [msgViewerOpen, setMsgViewerOpen] = React.useState(false);
  const [msgViewerItem, setMsgViewerItem] = React.useState<any | null>(null);

  const pkgTitle = params.get("package") || "Service Package";
  const country = params.get("country") || "";
  const txId = params.get("tx") || "";

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !uid) return;
        setLoading(true);
        setError("");
        const col = collection(db, "AdminUploads");
        // Simple where on userId only; no composite indexes
        const q = query(col, where("userId", "==", uid));
        const snap = await getDocs(q);
        let list: UploadRow[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            packageName: data.packageName || null,
            country: data.country || null,
            fileUrl: data.downloadURL || data.fileUrl || null,
            filePath: data.storagePath || data.filePath || null,
            uploadTime: data.uploadedAt || data.uploadTime || null,
            title: data.title || null,
            transactionId: data.transactionId || data.txId || null,
          } as UploadRow;
        });
        // If tx filter present, prefer strict match by transactionId first
        if (txId.trim()) {
          list = list.filter((r) => (r.transactionId || "") === txId);
        }
        // If package filter present, filter client-side (exact, case-insensitive)
        if (pkgTitle.trim()) {
          const norm = (s: any) => (s ?? "").toString().toLowerCase();
          const pkgNorm = norm(pkgTitle);
          list = list.filter((r) => norm(r.packageName) === pkgNorm);
        }
        if (country.trim()) {
          const norm = (s: any) => (s ?? "").toString().toLowerCase();
          const c = norm(country);
          list = list.filter((r) => norm(r.country) === c);
        }
        // Sort by uploadTime desc
        list.sort((a: any, b: any) => {
          const at =
            a.uploadTime?.toMillis?.() ||
            (a.uploadTime ? a.uploadTime.seconds * 1000 : 0);
          const bt =
            b.uploadTime?.toMillis?.() ||
            (b.uploadTime ? b.uploadTime.seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setRows(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load documents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, pkgTitle, country]);

  // Load the transaction detail for header info
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !txId) return;
        const snap = await getDoc(doc(db, "Transactions", txId));
        if (!cancelled)
          setTxDetail(
            snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null
          );
      } catch (_) {
        if (!cancelled) setTxDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [txId]);

  // Load admin messages for this transaction
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !txId) {
          setMessages([]);
          return;
        }
        const q1 = query(
          collection(db, "AdminMessages"),
          where("transactionId", "==", txId)
        );
        const snap = await getDocs(q1);
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .sort((a, b) => {
            const at =
              (a.createdAt as any)?.toMillis?.() ||
              ((a.createdAt as any)?.seconds || 0) * 1000;
            const bt =
              (b.createdAt as any)?.toMillis?.() ||
              ((b.createdAt as any)?.seconds || 0) * 1000;
            return bt - at;
          });
        if (!cancelled) setMessages(rows);
      } catch (_) {
        if (!cancelled) setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [txId]);

  // (Removed) User replies are not loaded; messages are view-only from admin

  const formatDateDMY = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ||
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    if (!ms) return "—";
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const fileName = (r: UploadRow) => {
    if (r.title) return r.title;
    if (r.filePath) return r.filePath.split("/").pop() || "Document";
    if (r.fileUrl) {
      try {
        const u = new URL(r.fileUrl);
        return decodeURIComponent(u.pathname.split("/").pop() || "Document");
      } catch {
        return decodeURIComponent(
          r.fileUrl.split("?")[0].split("/").pop() || "Document"
        );
      }
    }
    return "Document";
  };

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">
            Uploaded Documents
          </h1>
          <p className="text-sm text-gray-600">
            {pkgTitle}
            {country ? ` • ${country}` : ""}
          </p>
        </div>

        {/* Package & Company Details */}
        <div className="mb-6 rounded-2xl bg-emerald-50/40 shadow-sm ring-1 ring-emerald-100 p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7l9-4 9 4-9 4-9-4m0 6l9 4 9-4"
                  />
                </svg>
              </span>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Package & Company
                </div>
                <div className="text-sm text-gray-600">
                  Details of your purchased package
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">Company Name</div>
              <div className="font-medium text-gray-900">
                {txDetail?.company?.proposedName ||
                  txDetail?.company?.name ||
                  "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Country</div>
              <div className="font-medium text-gray-900">
                {txDetail?.country || country || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Package Name</div>
              <div className="font-medium text-gray-900">
                {txDetail?.packageTitle ||
                  txDetail?.packageKey ||
                  pkgTitle ||
                  "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Company Type</div>
              <div className="font-medium text-gray-900">
                {txDetail?.company?.companyType || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Member Type</div>
              <div className="font-medium text-gray-900">
                {(() => {
                  const mt = (txDetail?.company?.memberType || "")
                    .toString()
                    .toLowerCase();
                  if (!mt) return "—";
                  return mt === "single"
                    ? "Single Member"
                    : mt === "multiple"
                    ? "Multiple Member"
                    : txDetail?.company?.memberType;
                })()}
              </div>
            </div>
            {String(txDetail?.country || country || "").toUpperCase() ===
              "USA" && (
              <div>
                <div className="text-xs text-gray-500">State</div>
                <div className="font-medium text-gray-900">
                  {txDetail?.company?.state || "—"}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading && <div className="text-gray-600">Loading…</div>}
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl bg-white shadow ring-1 ring-gray-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="text-left px-4 py-3 font-semibold w-12">Sl</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Package name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Country</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Document Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Upload Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">
                        {r.packageName || pkgTitle || "Service Package"}
                      </td>
                      <td className="px-4 py-3">
                        {r.country || country || "—"}
                      </td>
                      <td className="px-4 py-3">{fileName(r)}</td>
                      <td className="px-4 py-3">
                        {formatDateDMY(r.uploadTime)}
                      </td>
                      <td className="px-4 py-3">
                        {r.fileUrl ? (
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            >
                              View
                            </a>
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Messages Section */}
        <div className="mt-6 rounded-2xl bg-indigo-50/40 shadow-sm ring-1 ring-indigo-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8h10M7 12h8m-8 4h6"
                />
              </svg>
            </span>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Messages
              </div>
              <div className="text-sm text-gray-600">Messages from admin</div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl ring-1 ring-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-3 font-semibold">Sl</th>
                  <th className="px-4 py-3 font-semibold">Sent By</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Preview</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const onlyAdmin = [...messages]
                    .map((m: any) => ({ ...m, _type: "admin" }))
                    .sort((a: any, b: any) => {
                      const at =
                        (a.createdAt as any)?.toMillis?.() ||
                        ((a.createdAt as any)?.seconds || 0) * 1000;
                      const bt =
                        (b.createdAt as any)?.toMillis?.() ||
                        ((b.createdAt as any)?.seconds || 0) * 1000;
                      return bt - at;
                    });
                  if (onlyAdmin.length === 0) {
                    return (
                      <tr className="border-t">
                        <td className="px-4 py-3 text-gray-700">—</td>
                        <td className="px-4 py-3 text-gray-700">—</td>
                        <td className="px-4 py-3 text-gray-700">—</td>
                        <td className="px-4 py-3 text-gray-700">No messages</td>
                        <td className="px-4 py-3">—</td>
                      </tr>
                    );
                  }
                  return onlyAdmin.map((row: any, idx: number) => (
                    <tr
                      key={`${row._type}-${row.id || idx}`}
                      className="border-t"
                    >
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700">Admin</td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatDateDMY(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 truncate max-w-[320px]">
                        {(row.message || row.text || "")
                          .toString()
                          .slice(0, 100)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setMsgViewerItem(row);
                            setMsgViewerOpen(true);
                          }}
                          className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {msgViewerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => {
              setMsgViewerOpen(false);
              setMsgViewerItem(null);
            }}
          >
            <div
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setMsgViewerOpen(false);
                  setMsgViewerItem(null);
                }}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-50 to-white border-b">
                <div className="text-sm text-gray-600">Conversation</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {pkgTitle}
                </div>
              </div>
              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
                {(() => {
                  const onlyAdmin = [...messages]
                    .map((m: any) => ({ ...m, _type: "admin" }))
                    .sort((a: any, b: any) => {
                      const at =
                        (a.createdAt as any)?.toMillis?.() ||
                        ((a.createdAt as any)?.seconds || 0) * 1000;
                      const bt =
                        (b.createdAt as any)?.toMillis?.() ||
                        ((b.createdAt as any)?.seconds || 0) * 1000;
                      return at - bt; // chronological
                    });
                  if (onlyAdmin.length === 0)
                    return (
                      <div className="text-sm text-gray-600">
                        No messages yet.
                      </div>
                    );
                  return (
                    <div className="space-y-3">
                      {onlyAdmin.map((row: any, idx: number) => (
                        <div
                          key={`${row._type}-${row.id || idx}`}
                          className={`rounded-lg border p-3 ${"border-purple-200 bg-purple-50/40"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-gray-700">
                              Admin
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateDMY(row.createdAt)}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                            {row.message || row.text || ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              {/* Reply UI removed: messages are view-only */}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
