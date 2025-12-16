"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params?.id || "";
  const type = (search.get("type") || "pending").toLowerCase();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [detail, setDetail] = React.useState<any | null>(null);
  const [uploads, setUploads] = React.useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [fileTitle, setFileTitle] = React.useState("");
  const [fileObj, setFileObj] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string>("");
  const [uploaderId, setUploaderId] = React.useState<string>("");
  const [uploaderName, setUploaderName] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerItem, setViewerItem] = React.useState<any | null>(null);
  const [deletingId, setDeletingId] = React.useState<string>("");
  const [msgText, setMsgText] = React.useState("");
  const [msgSending, setMsgSending] = React.useState(false);
  const [msgError, setMsgError] = React.useState<string>("");
  const [msgSuccess, setMsgSuccess] = React.useState<string>("");
  const [messages, setMessages] = React.useState<any[]>([]);
  const [msgViewerOpen, setMsgViewerOpen] = React.useState(false);
  const [msgViewerItem, setMsgViewerItem] = React.useState<any | null>(null);
  const [msgDeletingId, setMsgDeletingId] = React.useState<string>("");
  const [statusUpdating, setStatusUpdating] = React.useState(false);
  const [statusError, setStatusError] = React.useState<string>("");
  const [userMessages, setUserMessages] = React.useState<any[]>([]);
  const [userMsgViewerOpen, setUserMsgViewerOpen] = React.useState(false);
  const [userMsgViewerItem, setUserMsgViewerItem] = React.useState<any | null>(
    null
  );
  const [pendingLink, setPendingLink] = React.useState<any | null>(null);

  const formatDateTime = (ts?: Timestamp) =>
    ts
      ? new Date(
          (ts as any)?.toMillis?.() ?? ((ts as any)?.seconds || 0) * 1000
        ).toLocaleString()
      : "—";

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUploaderId(u?.uid || "");
      setUploaderName(u?.displayName || u?.email || "");
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !id) return;
        setLoading(true);
        setError("");
        const src = type === "pending" ? "PendingOrders" : "Transactions";
        const baseDoc = await getDoc(doc(collection(db, src), id));
        if (!baseDoc.exists()) {
          throw new Error("Order not found");
        }
        const base = { id: baseDoc.id, ...(baseDoc.data() as any) } as any;

        let enriched: any = { ...base };
        if (type === "pending") {
          const txId = base.transactionId || base.txId || "";
          if (txId) {
            try {
              const txSnap = await getDoc(
                doc(collection(db, "Transactions"), txId)
              );
              if (txSnap.exists()) {
                const tx = { id: txSnap.id, ...(txSnap.data() as any) } as any;
                enriched = { ...tx, pending: base };
              }
            } catch {}
          }
        } else {
          try {
            const q1 = query(
              collection(db, "PendingOrders"),
              where("transactionId", "==", id)
            );
            const snap = await getDocs(q1);
            if (!cancelled && !snap.empty) {
              const d = snap.docs[0];
              setPendingLink({ id: d.id, ...(d.data() as any) });
            } else if (!cancelled) {
              setPendingLink(null);
            }
          } catch {
            if (!cancelled) setPendingLink(null);
          }
        }

        const userId = enriched.userId || base.userId || "";
        let displayName: string | null = null;
        let displayEmail: string | null = null;
        if (userId) {
          try {
            const uSnap = await getDoc(doc(collection(db, "Users"), userId));
            if (uSnap.exists()) {
              const dn = (uSnap.data() as any)?.displayName || null;
              const de = (uSnap.data() as any)?.email || null;
              displayName = dn ? String(dn) : null;
              displayEmail = de ? String(de) : null;
            }
          } catch {}
        }

        const packageDisplay =
          enriched.packageTitle ||
          enriched.packageKey ||
          enriched.packageName ||
          "";
        const createdAt: Timestamp | undefined =
          enriched.createdAt || base.createdAt;

        const combined = {
          ...enriched,
          displayName,
          displayEmail,
          packageDisplay,
          createdAt,
        };
        if (!cancelled) setDetail(combined);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, type]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !detail?.userId) {
          setUploads([]);
          return;
        }
        const txId =
          detail?.id ||
          (detail as any)?.transactionId ||
          (detail as any)?.txId ||
          null;
        const q1 = query(
          collection(db, "AdminUploads"),
          where("userId", "==", detail.userId)
        );
        const snap = await getDocs(q1);
        let rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((r: any) => (r.transactionId || r.txId || null) === txId);
        rows.sort((a, b) => {
          const at =
            (a.uploadedAt as any)?.toMillis?.() ||
            (a.uploadedAt?.seconds || 0) * 1000;
          const bt =
            (b.uploadedAt as any)?.toMillis?.() ||
            (b.uploadedAt?.seconds || 0) * 1000;
          return bt - at;
        });
        if (!cancelled) setUploads(rows);
      } catch (e) {
        if (!cancelled) setUploads([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail?.userId, detail?.id]);

  // Load AdminMessages for this transaction
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !detail?.id) {
          setMessages([]);
          return;
        }
        const q1 = query(
          collection(db, "AdminMessages"),
          where("transactionId", "==", detail.id)
        );
        const snap = await getDocs(q1);
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .sort((a, b) => {
            const at =
              (a.createdAt as any)?.toMillis?.() ||
              (a.createdAt?.seconds || 0) * 1000;
            const bt =
              (b.createdAt as any)?.toMillis?.() ||
              (b.createdAt?.seconds || 0) * 1000;
            return bt - at;
          });
        if (!cancelled) setMessages(rows);
      } catch (e) {
        if (!cancelled) setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail?.id]);

  // Load Messages from User for this order (by userId and package)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !detail?.userId) {
          setUserMessages([]);
          return;
        }
        const q1 = query(
          collection(db, "UserMessage"),
          where("userId", "==", detail.userId)
        );
        const snap = await getDocs(q1);
        let rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        if (detail.packageDisplay) {
          rows = rows.filter(
            (r) => (r.packageName || "") === detail.packageDisplay
          );
        }
        rows.sort((a: any, b: any) => {
          const at =
            (a.createdAt as any)?.toMillis?.() ||
            ((a.createdAt as any)?.seconds || 0) * 1000;
          const bt =
            (b.createdAt as any)?.toMillis?.() ||
            ((b.createdAt as any)?.seconds || 0) * 1000;
          return bt - at;
        });
        if (!cancelled) setUserMessages(rows);
      } catch (e) {
        if (!cancelled) setUserMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail?.userId, detail?.packageDisplay]);

  return (
    <section className="py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-mono">{id}</span> · Source:{" "}
              {type === "pending" ? "PendingOrders" : "Transactions"}
            </p>
          </div>
          <Link
            href={
              pathname.startsWith("/manager")
                ? "/manager/dashboard?status=pending"
                : "/admin/dashboard?status=pending"
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Sales Dashboard
          </Link>
        </div>
        {userMsgViewerOpen && userMsgViewerItem && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setUserMsgViewerOpen(false);
                setUserMsgViewerItem(null);
              }
            }}
          >
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
              <button
                onClick={() => {
                  setUserMsgViewerOpen(false);
                  setUserMsgViewerItem(null);
                }}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-white border-b">
                <div className="text-sm text-gray-600">Package</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {userMsgViewerItem?.packageName ||
                    detail?.packageDisplay ||
                    "Service Package"}
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="text-sm font-semibold text-emerald-700 mb-2">
                    Message
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {userMsgViewerItem?.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Segment 1: Purchase details */}
        <div className="rounded-2xl bg-emerald-50/40 shadow-sm ring-1 ring-emerald-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Package Purchase
                </h2>
                <p className="text-sm text-gray-600">
                  Summary of the purchased package
                </p>
              </div>
            </div>
          </div>
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <Info
              label="User Name"
              value={
                detail?.displayName || detail?.userName || detail?.email || "—"
              }
            />
            <Info label="Email" value={detail?.displayEmail || "—"} />
            <Info label="Package Name" value={detail?.packageDisplay || "—"} />
            <Info label="Country" value={detail?.country || "—"} />
            <Info
              label="Additional Services"
              value={
                Array.isArray(detail?.addOns) && detail?.addOns?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {detail.addOns.map((a: any) => (
                      <li key={a.id} className="flex items-center gap-2">
                        <span className="inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          ${Number(a.price || 0).toFixed(0)}
                        </span>
                        <span>{a.title || a.id}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )
              }
            />
            <Info
              label="Purchase Date"
              value={formatDateTime(detail?.createdAt)}
            />
          </div>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 border-dashed p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Amount Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-700">
              <div>
                Plan Price:{" "}
                {typeof detail?.breakdown?.planPrice === "number"
                  ? `$${Number(detail.breakdown.planPrice).toFixed(0)}`
                  : "—"}
              </div>
              <div>
                State Fee:{" "}
                {typeof detail?.breakdown?.stateFee === "number"
                  ? `$${Number(detail.breakdown.stateFee).toFixed(0)}`
                  : "—"}
              </div>
              <div>
                Monthly Fee:{" "}
                {typeof detail?.breakdown?.monthlyFee === "number"
                  ? `$${Number(detail.breakdown.monthlyFee).toFixed(0)}`
                  : "—"}
              </div>
              <div>
                Add-ons:{" "}
                {typeof detail?.breakdown?.addOnTotal === "number"
                  ? `$${Number(detail.breakdown.addOnTotal).toFixed(0)}`
                  : "—"}
              </div>
              <div>
                Discount:{" "}
                {typeof detail?.breakdown?.discount === "number"
                  ? `-$${Number(detail.breakdown.discount).toFixed(0)}`
                  : "—"}
              </div>
              <div className="font-semibold text-gray-900">
                Total:{" "}
                {typeof detail?.breakdown?.total === "number"
                  ? `$${Number(detail.breakdown.total).toFixed(0)}`
                  : typeof detail?.amount === "number"
                  ? `${detail?.currency || "USD"} ${Number(
                      detail.amount
                    ).toFixed(2)}`
                  : "—"}
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Company Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-700">
              <div>
                Company Name:{" "}
                {detail?.company?.proposedName || detail?.company?.name || "—"}
              </div>
              {String(detail?.country || "").toUpperCase() === "USA" && (
                <div>State: {detail?.company?.state || "—"}</div>
              )}
              <div>Company Type: {detail?.company?.companyType || "—"}</div>
              <div>
                Member Type:{" "}
                {(() => {
                  const mt = detail?.company?.memberType || "";
                  if (!mt) return "—";
                  const m = String(mt).toLowerCase();
                  return m === "single"
                    ? "Single Member"
                    : m === "multiple"
                    ? "Multiple Member"
                    : mt;
                })()}
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                Service Type: {detail?.company?.serviceType || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Package Features */}
        {Array.isArray(detail?.features) && detail.features.length > 0 && (
          <div className="mt-6 rounded-2xl bg-indigo-50/40 shadow-sm ring-1 ring-indigo-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Package Features
                  </h2>
                  <p className="text-sm text-gray-600">
                    Included in this package
                  </p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {detail.features.map((f: any, idx: number) => (
                <div
                  key={`${idx}-${String(f)}`}
                  className="flex items-start gap-2 text-sm text-gray-800"
                >
                  <svg
                    className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{String(f)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Segment 2: Admin uploads for this order */}
        <div className="mt-6 rounded-2xl bg-sky-50/40 shadow-sm ring-1 ring-sky-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
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
                    d="M4 4h16v16H4z"
                  />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Admin Uploads
                </h2>
                <p className="text-sm text-gray-600">
                  Files uploaded for this order
                </p>
              </div>
            </div>
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
            >
              Upload
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl ring-1 ring-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-3 font-semibold">Sl</th>
                  <th className="px-4 py-3 font-semibold">Document Name</th>
                  <th className="px-4 py-3 font-semibold">Upload Date</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {uploads.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-3 text-gray-700">—</td>
                    <td className="px-4 py-3 text-gray-700">No files</td>
                    <td className="px-4 py-3 text-gray-700">—</td>
                    <td className="px-4 py-3">—</td>
                  </tr>
                )}
                {uploads.map((u, idx) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {u.title || "Untitled"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(u.uploadedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setViewerItem(u);
                            setViewerOpen(true);
                          }}
                          className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        >
                          View
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              if (!db || !storage) return;
                              if (
                                !confirm(
                                  "Delete this document? This cannot be undone."
                                )
                              )
                                return;
                              setDeletingId(u.id);
                              const storagePath =
                                u.storagePath || u.path || null;
                              const url = u.downloadURL;
                              const objectRef = storagePath
                                ? ref(storage, storagePath)
                                : ref(storage, url);
                              try {
                                await (
                                  await import("firebase/storage")
                                ).deleteObject(objectRef);
                              } catch (e) {
                                console.warn(
                                  "Failed to delete storage object (continuing)",
                                  e
                                );
                              }
                              await deleteDoc(
                                doc(collection(db, "AdminUploads"), u.id)
                              );
                              setUploads((prev) =>
                                prev.filter((it) => it.id !== u.id)
                              );
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setDeletingId("");
                            }
                          }}
                          className="px-2 py-1 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-60"
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-purple-50/40 shadow-sm ring-1 ring-purple-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 ring-1 ring-purple-100">
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages
                </h2>
                <p className="text-sm text-gray-600">
                  Admin messages and user replies
                </p>
              </div>
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
                  const merged = [
                    ...messages.map((m: any) => ({ ...m, _type: "admin" })),
                    ...userMessages.map((m: any) => ({ ...m, _type: "user" })),
                  ].sort((a: any, b: any) => {
                    const at =
                      (a.createdAt as any)?.toMillis?.() ||
                      ((a.createdAt as any)?.seconds || 0) * 1000;
                    const bt =
                      (b.createdAt as any)?.toMillis?.() ||
                      ((b.createdAt as any)?.seconds || 0) * 1000;
                    return bt - at;
                  });
                  if (merged.length === 0) {
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
                  return merged.map((row: any, idx: number) => (
                    <tr
                      key={`${row._type}-${row.id || idx}`}
                      className="border-t"
                    >
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {row._type === "admin" ? "Admin" : "User"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatDateTime(row.createdAt)}
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

        {/* Segment 5: Status */}
        {/* Segment 4: Status */}
        <div className="mt-6 rounded-2xl bg-amber-50/40 shadow-sm ring-1 ring-amber-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
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
                  d="M12 8v8m4-4H8"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Order Status
              </h2>
              <p className="text-sm text-gray-600">Change the order status</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ring-1 ${
                (detail?.status || type) === "completed"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200"
              }`}
            >
              {(detail?.status || type) === "completed"
                ? "completed"
                : "pending"}
            </span>
            {(detail?.status || type) !== "completed" && (
              <button
                onClick={async () => {
                  try {
                    if (!db) return;
                    setStatusError("");
                    setStatusUpdating(true);
                    // Ensure we have tx id and pending id
                    const txId = detail?.id || detail?.transactionId || "";
                    const pendingId =
                      type === "pending" ? id : pendingLink?.id || "";
                    if (!txId) throw new Error("Missing transaction ID");
                    // 1) Update transaction status -> completed
                    await updateDoc(doc(collection(db, "Transactions"), txId), {
                      status: "completed",
                    });
                    // 2) If there is a PendingOrders doc, mirror to CompletedOrders and delete pending
                    if (pendingId) {
                      const pending =
                        type === "pending"
                          ? (detail as any)?.pending || {}
                          : pendingLink || {};
                      const completedPayload: any = {
                        userId: pending.userId || detail?.userId || null,
                        packageName:
                          pending.packageName || detail?.packageDisplay || null,
                        country: pending.country || detail?.country || null,
                        status: "completed",
                        totalAmount:
                          pending.totalAmount || detail?.amount || null,
                        createdAt:
                          pending.createdAt ||
                          detail?.createdAt ||
                          Timestamp.now(),
                        completedAt: Timestamp.now(),
                        transactionId: txId,
                      };
                      await addDoc(
                        collection(db, "CompletedOrders"),
                        completedPayload
                      );
                      await deleteDoc(
                        doc(collection(db, "PendingOrders"), pendingId)
                      );
                    }
                    // Update local state
                    setDetail((prev: any) =>
                      prev ? { ...prev, status: "completed" } : prev
                    );
                    // Redirect to the transaction details page so it appears under Completed Orders tab
                    const base = pathname.startsWith("/manager")
                      ? "/manager/orders"
                      : "/admin/orders";
                    router.replace(`${base}/${txId}?type=tx`);
                  } catch (e: any) {
                    setStatusError(e?.message || "Failed to mark completed");
                  } finally {
                    setStatusUpdating(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                disabled={statusUpdating}
              >
                {statusUpdating ? "Updating..." : "Mark Completed"}
              </button>
            )}
          </div>
          {statusError && (
            <div className="mt-3 text-sm text-red-600">{statusError}</div>
          )}
        </div>
      </div>

      {uploadOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !uploading)
              setUploadOpen(false);
          }}
        >
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-0">
            <div className="p-5 sm:p-6 border-b">
              <div className="text-lg font-semibold text-gray-900">
                Upload Document
              </div>
              <div className="text-sm text-gray-600">
                Attach a file for this user and package.
              </div>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              {uploadError && (
                <div className="text-sm text-red-600">{uploadError}</div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600">Title</label>
                <input
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="e.g. Incorporation Certificate"
                  disabled={uploading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600">File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp"
                  onChange={(e) => setFileObj(e.target.files?.[0] || null)}
                  disabled={uploading}
                  className="text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600">
                  Message to user (optional)
                </label>
                <textarea
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[90px]"
                  placeholder="Write a message to the user regarding this package (optional)"
                  disabled={uploading}
                />
                <div className="text-xs text-gray-500">
                  You can send a message, upload a document, or do both.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t p-4">
              <button
                onClick={() => !uploading && setUploadOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!db || !storage) return;
                    setUploadError("");
                    if (!detail?.userId) {
                      setUploadError("Missing user");
                      return;
                    }
                    if (!detail?.packageDisplay) {
                      setUploadError("Missing package name");
                      return;
                    }
                    if (!fileObj && !msgText.trim()) {
                      setUploadError("Provide a file or a message");
                      return;
                    }
                    setUploading(true);
                    let uploadedSomething = false;

                    if (fileObj) {
                      if (!fileTitle.trim()) {
                        setUploadError("Please provide a title for the file");
                        setUploading(false);
                        return;
                      }
                      const safeName = fileObj.name.replace(
                        /[^a-zA-Z0-9_.-]/g,
                        "_"
                      );
                      const path = `admin-uploads/${
                        detail.userId
                      }/${Date.now()}_${safeName}`;
                      const storageRef = ref(storage, path);
                      await uploadBytes(storageRef, fileObj);
                      const url = await getDownloadURL(storageRef);
                      const payload: any = {
                        userId: detail.userId,
                        transactionId:
                          detail.id ||
                          detail.transactionId ||
                          (detail as any)?.txId ||
                          id ||
                          null,
                        userName:
                          detail.displayName ||
                          detail.userName ||
                          detail.displayEmail ||
                          "",
                        packageName: detail.packageDisplay,
                        country: detail.country || null,
                        title: fileTitle.trim(),
                        downloadURL: url,
                        storagePath: path,
                        uploadedAt: Timestamp.now(),
                        uploaderId: uploaderId || null,
                        uploaderName: uploaderName || null,
                      };
                      await addDoc(collection(db, "AdminUploads"), payload);
                      uploadedSomething = true;
                    }

                    if (msgText.trim()) {
                      const msgPayload: any = {
                        userId: detail.userId,
                        transactionId: detail.id || null,
                        packageName: detail.packageDisplay,
                        country: detail.country || null,
                        message: msgText.trim(),
                        createdAt: Timestamp.now(),
                        senderId: uploaderId || null,
                        senderName: uploaderName || null,
                        senderRole: "admin",
                      };
                      const refDoc = await addDoc(
                        collection(db, "AdminMessages"),
                        msgPayload
                      );
                      setMessages((prev) => [
                        { id: refDoc.id, ...msgPayload },
                        ...prev,
                      ]);
                    }

                    setUploadOpen(false);
                    setFileTitle("");
                    setFileObj(null);
                    setMsgText("");

                    if (uploadedSomething) {
                      // refresh using userId and then strictly filter by computed txId
                      try {
                        const txId =
                          detail?.id ||
                          (detail as any)?.transactionId ||
                          (detail as any)?.txId ||
                          id ||
                          null;
                        const q1 = query(
                          collection(db, "AdminUploads"),
                          where("userId", "==", detail.userId)
                        );
                        const snap = await getDocs(q1);
                        let rows = snap.docs
                          .map((d) => ({ id: d.id, ...(d.data() as any) }))
                          .filter(
                            (r: any) =>
                              (r.transactionId || r.txId || null) === txId
                          );
                        if (rows.length === 0 && detail.packageDisplay) {
                          rows = snap.docs
                            .map((d) => ({ id: d.id, ...(d.data() as any) }))
                            .filter(
                              (r: any) =>
                                (r.packageName || "") === detail.packageDisplay
                            );
                        }
                        rows.sort((a, b) => {
                          const at =
                            (a.uploadedAt as any)?.toMillis?.() ||
                            (a.uploadedAt?.seconds || 0) * 1000;
                          const bt =
                            (b.uploadedAt as any)?.toMillis?.() ||
                            (b.uploadedAt?.seconds || 0) * 1000;
                          return bt - at;
                        });
                        setUploads(rows);
                      } catch {}
                    }
                  } catch (e: any) {
                    setUploadError(e?.message || "Failed to upload");
                  } finally {
                    setUploading(false);
                  }
                }}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {msgViewerOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMsgViewerOpen(false);
              setMsgViewerItem(null);
            }
          }}
        >
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
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
            <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-50 to-white border-b">
              <div className="text-sm text-gray-600">Conversation</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {detail?.packageDisplay || "Service Package"}
              </div>
            </div>
            <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
              {(() => {
                const merged = [
                  ...messages.map((m: any) => ({ ...m, _type: "admin" })),
                  ...userMessages.map((m: any) => ({ ...m, _type: "user" })),
                ].sort((a: any, b: any) => {
                  const at =
                    (a.createdAt as any)?.toMillis?.() ||
                    ((a.createdAt as any)?.seconds || 0) * 1000;
                  const bt =
                    (b.createdAt as any)?.toMillis?.() ||
                    ((b.createdAt as any)?.seconds || 0) * 1000;
                  return at - bt; // chronological
                });
                if (merged.length === 0)
                  return (
                    <div className="text-sm text-gray-600">
                      No messages yet.
                    </div>
                  );
                return (
                  <div className="space-y-3">
                    {merged.map((row: any, idx: number) => {
                      const isSelected = !!(
                        msgViewerItem &&
                        msgViewerItem.id === row.id &&
                        msgViewerItem._type === row._type
                      );
                      return (
                        <div
                          key={`${row._type}-${row.id || idx}`}
                          className={`rounded-lg border p-3 ${
                            row._type === "admin"
                              ? "border-purple-200 bg-purple-50/40"
                              : "border-emerald-200 bg-emerald-50/40"
                          } ${isSelected ? "ring-2 ring-indigo-400" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-gray-700">
                              {row._type === "admin" ? "Admin" : "User"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(row.createdAt)}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                            {row.message || row.text || ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {viewerOpen && viewerItem && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewerOpen(false);
              setViewerItem(null);
            }
          }}
        >
          <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                setViewerOpen(false);
                setViewerItem(null);
              }}
              aria-label="Close"
              className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 z-10"
            >
              ✕
            </button>
            <div className="px-5 pt-5 pb-3 border-b">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-900 truncate">
                    {viewerItem.title || "Document"}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {viewerItem.packageName} •{" "}
                    {formatDateTime(viewerItem.uploadedAt)}
                  </div>
                </div>
                <a
                  href={viewerItem.downloadURL}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Open in new tab
                </a>
              </div>
            </div>
            <div className="p-0 bg-gray-50" style={{ height: "70vh" }}>
              {(() => {
                const url: string = viewerItem.downloadURL || "";
                const lower = url.toLowerCase();
                const isImage = [
                  ".png",
                  ".jpg",
                  ".jpeg",
                  ".gif",
                  ".webp",
                  ".bmp",
                  ".svg",
                ].some((ext) => lower.includes(ext));
                const isPdf = lower.includes(".pdf");
                const isOffice = [
                  ".doc",
                  ".docx",
                  ".ppt",
                  ".pptx",
                  ".xls",
                  ".xlsx",
                ].some((ext) => lower.includes(ext));
                if (isImage) {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={url}
                        alt={viewerItem.title || "Document"}
                        className="max-w-full max-h-full rounded-lg shadow"
                      />
                    </div>
                  );
                }
                if (isPdf) {
                  return (
                    <iframe
                      title="PDF Viewer"
                      src={url}
                      className="w-full h-full"
                    />
                  );
                }
                if (isOffice) {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <div className="max-w-xl text-center">
                        <div className="text-base font-medium text-gray-900 mb-2">
                          Preview not available
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          This file type cannot be embedded here. Please open it
                          in a new tab or download it.
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                          >
                            Open in new tab
                          </a>
                          <a
                            href={url}
                            download
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }
                // Fallback: try direct iframe
                return (
                  <iframe
                    title="Document Viewer"
                    src={url}
                    className="w-full h-full"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {msgViewerOpen && msgViewerItem && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMsgViewerOpen(false);
              setMsgViewerItem(null);
            }
          }}
        >
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
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
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-white border-b">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7l9-4 9 4-9 4-9-4"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-gray-600">Package</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {msgViewerItem.packageName || "Service Package"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="text-sm font-semibold text-emerald-700 mb-2">
                  Message
                </div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {msgViewerItem.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium text-gray-900 break-words">{value}</div>
    </div>
  );
}
