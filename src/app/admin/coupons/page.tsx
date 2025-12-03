"use client";

import React from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

interface Coupon {
  id: string;
  code: string;
  percent: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const formatDateTime = (ts?: Timestamp | null) => {
  if (!ts) return "—";
  const ms =
    (ts as any)?.toMillis?.() ??
    ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
  return ms ? new Date(ms).toLocaleString() : "—";
};

export default function AdminCouponsPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [items, setItems] = React.useState<Coupon[]>([]);

  const [addOpen, setAddOpen] = React.useState(false);
  const [addSaving, setAddSaving] = React.useState(false);
  const [newCode, setNewCode] = React.useState("");
  const [newPercent, setNewPercent] = React.useState<string>("");
  const [addError, setAddError] = React.useState("");

  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Coupon | null>(null);
  const [editCode, setEditCode] = React.useState("");
  const [editPercent, setEditPercent] = React.useState<string>("");
  const [editSaving, setEditSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db) return;
        setLoading(true);
        setError("");
        const snap = await getDocs(
          query(collection(db, "CouponCodes"), orderBy("createdAt"))
        );
        const rows: Coupon[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            code: (data.code || data.Code || "").toString(),
            percent: Number(data.percent ?? data.Percent ?? 0),
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
          };
        });
        if (!cancelled) setItems(rows.reverse());
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load coupons");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetAddForm = () => {
    setNewCode("");
    setNewPercent("");
    setAddError("");
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coupon Codes</h1>
            <p className="text-gray-600">
              Manage discount codes and percentages
            </p>
          </div>
          <button
            onClick={() => {
              resetAddForm();
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            Add New Coupon
          </button>
        </div>

        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow ring-1 ring-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Discount %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.percent}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateTime(c.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          onClick={() => {
                            setSelected(c);
                            setViewOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                          onClick={() => {
                            setSelected(c);
                            setEditCode(c.code);
                            setEditPercent(String(c.percent));
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No coupons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add coupon modal */}
        {addOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !addSaving && setAddOpen(false)}
          >
            <div
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !addSaving && setAddOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-white">
                <div className="text-lg font-semibold text-gray-900">
                  Add New Coupon
                </div>
                {addError && (
                  <div className="mt-2 text-sm text-rose-600">{addError}</div>
                )}
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Code</label>
                  <input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="e.g. SAVE10"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">
                    Discount %
                  </label>
                  <input
                    value={newPercent}
                    onChange={(e) => setNewPercent(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="e.g. 10"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={async () => {
                      try {
                        setAddError("");
                        const code = newCode.trim().toUpperCase();
                        const p = Number(newPercent);
                        if (!code || !isFinite(p) || p <= 0) {
                          setAddError(
                            "Enter a valid code and percentage (> 0)"
                          );
                          return;
                        }
                        setAddSaving(true);
                        const colRef = collection(db, "CouponCodes");
                        const ref = await addDoc(colRef, {
                          code,
                          percent: p,
                          createdAt: serverTimestamp(),
                          updatedAt: serverTimestamp(),
                        });
                        const snap = await getDoc(ref);
                        const data = (snap.data() as any) || {};
                        setItems((prev) => [
                          {
                            id: ref.id,
                            code,
                            percent: p,
                            createdAt: data.createdAt ?? null,
                            updatedAt: data.updatedAt ?? null,
                          },
                          ...prev,
                        ]);
                        setAddOpen(false);
                      } catch (e: unknown) {
                        setAddError(
                          e instanceof Error
                            ? e.message
                            : "Failed to add coupon"
                        );
                      } finally {
                        setAddSaving(false);
                      }
                    }}
                    disabled={addSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {addSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View modal */}
        {viewOpen && selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setViewOpen(false)}
          >
            <div
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-white">
                <div className="text-lg font-semibold text-gray-900">
                  Coupon Details
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Code:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {selected.code}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Discount %:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {selected.percent}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {formatDateTime(selected.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {formatDateTime(selected.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editOpen && selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !editSaving && setEditOpen(false)}
          >
            <div
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !editSaving && setEditOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-white">
                <div className="text-lg font-semibold text-gray-900">
                  Edit Coupon
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Code</label>
                  <input
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="e.g. SAVE10"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">
                    Discount %
                  </label>
                  <input
                    value={editPercent}
                    onChange={(e) => setEditPercent(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="e.g. 10"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={async () => {
                      try {
                        const code = editCode.trim().toUpperCase();
                        const p = Number(editPercent);
                        if (!code || !isFinite(p) || p <= 0) {
                          alert("Enter a valid code and percentage (> 0)");
                          return;
                        }
                        setEditSaving(true);
                        const ref = doc(db, "CouponCodes", selected.id);
                        await updateDoc(ref, {
                          code,
                          percent: p,
                          updatedAt: serverTimestamp(),
                        });
                        const snap = await getDoc(ref);
                        const data = (snap.data() as any) || {};
                        setItems((prev) =>
                          prev.map((item) =>
                            item.id === selected.id
                              ? {
                                  id: selected.id,
                                  code,
                                  percent: p,
                                  createdAt: data.createdAt ?? null,
                                  updatedAt: data.updatedAt ?? null,
                                }
                              : item
                          )
                        );
                        setEditOpen(false);
                      } catch (e: unknown) {
                        alert(
                          e instanceof Error
                            ? e.message
                            : "Failed to edit coupon"
                        );
                      } finally {
                        setEditSaving(false);
                      }
                    }}
                    disabled={editSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {editSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
