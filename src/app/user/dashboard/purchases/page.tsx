"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import UserLayout from "@/components/user/UserLayout";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface TxnItem {
  id: string;
  packageKey?: string | null;
  packageTitle?: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt?: Timestamp;
  country?: string | null;
  company?: {
    state?: string;
    companyType?: string;
    proposedName?: string;
    serviceType?: string;
    memberType?: string;
  } | null;
  addOns?: { id: string; title: string; price: number }[];
  features?: string[];
  breakdown?: {
    planPrice: number;
    stateFee: number;
    monthlyFee: number;
    addOnTotal: number;
    discount: number;
    total: number;
  };
}

const StatusBadge = ({ status }: { status?: string | null }) => {
  const s = (status || "").toString().toLowerCase();
  const cls =
    s === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : s === "pending"
      ? "bg-amber-50 text-amber-700"
      : s === "refunded"
      ? "bg-sky-50 text-sky-700"
      : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex px-2 py-1 rounded-lg font-medium text-sm ${cls}`}
    >
      {s || "—"}
    </span>
  );
};

export default function PurchasesPage() {
  return (
    <UserLayout>
      <React.Suspense
        fallback={
          <section className="py-6">
            <div className="text-gray-600">Loading...</div>
          </section>
        }
      >
        <PurchasesContent />
      </React.Suspense>
    </UserLayout>
  );
}

function PurchasesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [uid, setUid] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<TxnItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const viewId = params.get("view") || "";
  const [detail, setDetail] = React.useState<any | null>(null);
  const [detailError, setDetailError] = React.useState<string>("");
  const [detailLoading, setDetailLoading] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUid(null);
        setEmail(null);
        return;
      }
      setUid(u.uid);
      setEmail(u.email || null);
    });
    return () => unsub();
  }, [router]);

  // Removed client-side persistence from purchases page to avoid duplicates.

  // Subscribe to current user's transactions
  React.useEffect(() => {
    if (!db || !uid) return;
    setLoading(true);
    setError("");

    const q = query(
      collection(db, "Transactions"),
      where("userId", "==", uid || "")
      // Note: removed orderBy to avoid requiring a composite index; we'll sort client-side
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: TxnItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        // Sort client-side by createdAt desc if present
        list.sort((a, b) => {
          const at = (a.createdAt as any)?.toMillis?.() || 0;
          const bt = (b.createdAt as any)?.toMillis?.() || 0;
          return bt - at;
        });
        setItems(list);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load purchases");
        setLoading(false);
        // Ensure items cleared on error
        setItems([]);
      }
    );

    return () => unsub();
  }, [uid]);

  // Load detail if view query param present
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!db || !viewId) {
        setDetail(null);
        setDetailError("");
        return;
      }
      try {
        setDetailLoading(true);
        setDetailError("");
        const snap = await getDoc(doc(db, "Transactions", viewId));
        if (!snap.exists()) throw new Error("Purchase not found");
        const data = snap.data() as any;
        const recordUserId = data?.userId || "";
        const currentUserId = uid || "";
        if (recordUserId && currentUserId && recordUserId !== currentUserId) {
          throw new Error("You do not have access to this purchase");
        }
        if (!cancelled) setDetail({ id: snap.id, ...data });
      } catch (e: any) {
        if (!cancelled) setDetailError(e?.message || "Failed to load purchase");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewId, uid]);

  const closeDetail = React.useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    window.history.replaceState({}, "", url.toString());
    setDetail(null);
    setDetailError("");
  }, []);

  // Lock background scroll when modal is open
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const prev = body.style.overflow;
    if (viewId) body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [viewId]);

  return (
    <section className="py-6 min-h-[600px]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Purchased Packages</h1>
        <p className="text-sm text-gray-600">
          View all packages you have purchased.
        </p>
      </div>

      {loading && <div className="text-gray-600">Loading purchases...</div>}
      {error && items.length === 0 && (
        <div className="text-red-600 text-sm mb-3">{error}</div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          No Purchage yet.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/user/dashboard/purchases?view=${it.id}`}
            className="block rounded-2xl bg-white shadow ring-1 ring-gray-100 hover:shadow-md transition p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Package</div>
                <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>
                    {it.packageTitle || it.packageKey || "Service Package"}
                  </span>
                  {it.country && (
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {it.country}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Amount</div>
                <div className="text-base font-semibold text-gray-900">
                  {it.currency} {Number(it.amount || 0).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <StatusBadge status={it.status} />
              <span className="text-gray-500">
                {it.createdAt?.toDate
                  ? new Date(it.createdAt.toDate()).toLocaleString()
                  : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Detail Modal */}
      {viewId && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl p-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <button
              onClick={closeDetail}
              aria-label="Close"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              ✕
            </button>
            <div className="mb-6 pr-10 p-5 sm:p-6 rounded-t-2xl bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
              {detail && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
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
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </span>
                    <div className="truncate">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        {detail.country === "USA"
                          ? "USA Company Formation"
                          : detail.country === "UK"
                          ? "UK Company Formation"
                          : "Purchase Details"}
                      </h2>
                      <div className="text-xs text-gray-600 mt-0.5 truncate flex items-center gap-2">
                        <span>
                          {detail.packageTitle ||
                            detail.packageKey ||
                            "Service Package"}
                        </span>
                        <StatusBadge status={detail.status} />
                      </div>
                    </div>
                  </div>
                  {detail.country && (
                    <span className="shrink-0 inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      {detail.country}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 sm:p-8">
              {detailLoading && <div className="text-gray-600">Loading...</div>}
              {detailError && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 sm:p-4 text-sm">
                  {detailError}
                </div>
              )}
              {!detailLoading && !detailError && detail && (
                <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6 sm:space-y-7">
                    <div className="bg-white rounded-2xl shadow-md ring-1 ring-emerald-100/60 p-6 sm:p-7">
                      <h3 className="text-sm font-semibold text-emerald-700 mb-4 inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                        Package
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-gray-600">Title</span>
                          <span className="font-medium text-gray-900 text-right">
                            {detail.packageTitle ||
                              detail.packageKey ||
                              "Service Package"}
                          </span>
                        </div>
                        {detail.packageKey && (
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-gray-600">Key</span>
                            <span className="text-gray-900 text-right">
                              {detail.packageKey}
                            </span>
                          </div>
                        )}
                        {detail.country && (
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-gray-600">Country</span>
                            <span className="text-gray-900 text-right">
                              {detail.country}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md ring-1 ring-emerald-100/60 p-6 sm:p-7">
                      <h3 className="text-sm font-semibold text-emerald-700 mb-4 inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                        Payment
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-gray-600">Status</span>
                          <StatusBadge status={detail.status} />
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-gray-600">Amount</span>
                          <span className="font-medium text-gray-900">
                            {detail.currency || "USD"}{" "}
                            {Number(detail.amount || 0).toFixed(2)}
                          </span>
                        </div>
                        {detail.createdAt?.toDate && (
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-gray-600">Purchased At</span>
                            <span className="text-gray-900">
                              {new Date(
                                detail.createdAt.toDate()
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {detail.company && (
                      <div className="bg-white rounded-2xl shadow-md ring-1 ring-emerald-100/60 p-6 sm:p-7">
                        <h3 className="text-sm font-semibold text-emerald-700 mb-4 inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                          Company Details
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700">
                          {detail.company.proposedName && (
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-gray-600">
                                Proposed Name
                              </span>
                              <span className="text-gray-900 text-right">
                                {detail.company.proposedName}
                              </span>
                            </div>
                          )}
                          {detail.company.state && (
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-gray-600">State</span>
                              <span className="text-gray-900 text-right">
                                {detail.company.state}
                              </span>
                            </div>
                          )}
                          {detail.company.companyType && (
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-gray-600">
                                Company Type
                              </span>
                              <span className="text-gray-900 text-right">
                                {detail.company.companyType}
                              </span>
                            </div>
                          )}
                          {detail.company.serviceType && (
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-gray-600">
                                Service Type
                              </span>
                              <span className="text-gray-900 text-right">
                                {detail.company.serviceType}
                              </span>
                            </div>
                          )}
                          {detail.company.memberType && (
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-gray-600">Member Type</span>
                              <span className="text-gray-900 text-right capitalize">
                                {detail.company.memberType}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {Array.isArray(detail.addOns) && (
                      <div className="bg-white rounded-2xl shadow-md ring-1 ring-emerald-100/60 p-6 sm:p-7">
                        <h3 className="text-sm font-semibold text-emerald-700 mb-4 inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                          Additional Services
                        </h3>
                        {detail.addOns.length === 0 ? (
                          <div className="text-sm text-gray-600">
                            No additional services selected.
                          </div>
                        ) : (
                          <ul className="space-y-2 text-sm text-gray-700">
                            {detail.addOns.map((a: any) => (
                              <li
                                key={a.id}
                                className="flex items-center justify-between"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                  {a.title || a.id}
                                </span>
                                <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                  ${Number(a.price || 0).toFixed(0)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {Array.isArray(detail.features) &&
                      detail.features.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md ring-1 ring-emerald-100/60 p-6 sm:p-7">
                          <h3 className="text-sm font-semibold text-emerald-700 mb-4 inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                            Package Features
                          </h3>
                          <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                            {detail.features.map((f: string) => (
                              <li key={f} className="flex items-start gap-2">
                                <svg
                                  className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                  <div className="space-y-6 sm:space-y-7">
                    <div className="bg-white rounded-2xl shadow-md ring-1 ring-emerald-100/60 p-6 sm:p-7">
                      <h3 className="text-sm font-semibold text-emerald-700 mb-4 inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>{" "}
                        Meta
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-gray-600">Transaction ID</span>
                          <span className="font-mono text-gray-900 break-all text-right">
                            {detail.id}
                          </span>
                        </div>
                        {detail.email && (
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-gray-600">Email</span>
                            <span className="text-gray-900 break-all text-right">
                              {detail.email}
                            </span>
                          </div>
                        )}
                        {detail.breakdown && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="text-sm font-semibold text-emerald-700 mb-2">
                              Order Breakdown
                            </div>
                            <div className="space-y-1 text-sm text-gray-700">
                              <div className="flex justify-between">
                                <span>Plan Price</span>
                                <span>
                                  $
                                  {Number(
                                    detail.breakdown.planPrice || 0
                                  ).toFixed(0)}
                                </span>
                              </div>
                              {Number(detail.breakdown.stateFee || 0) > 0 && (
                                <div className="flex justify-between">
                                  <span>State Fee</span>
                                  <span>
                                    $
                                    {Number(
                                      detail.breakdown.stateFee || 0
                                    ).toFixed(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Monthly/Yearly Fee</span>
                                <span>
                                  $
                                  {Number(
                                    detail.breakdown.monthlyFee || 0
                                  ).toFixed(0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Additional Services</span>
                                <span>
                                  $
                                  {Number(
                                    detail.breakdown.addOnTotal || 0
                                  ).toFixed(0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Discount</span>
                                <span>
                                  -$
                                  {Number(
                                    detail.breakdown.discount || 0
                                  ).toFixed(0)}
                                </span>
                              </div>
                              <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                                <span>Total</span>
                                <span>
                                  $
                                  {Number(detail.breakdown.total || 0).toFixed(
                                    0
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
