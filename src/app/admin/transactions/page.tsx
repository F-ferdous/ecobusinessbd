"use client";

import React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";

type Tx = {
  id: string;
  userId: string;
  email?: string | null;
  userName?: string | null;
  packageKey?: string | null;
  packageTitle?: string | null;
  packageDetails?: any;
  amount: number;
  currency: string;
  status: string;
  createdAt?: Timestamp;
  orderId?: string | null;
  paymentMethod?: string | null;
  paymentIntentId?: string | null;
};

export default function AdminTransactionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [items, setItems] = React.useState<Tx[]>([]);
  const [selected, setSelected] = React.useState<Tx | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        if (!db) throw new Error("Firestore not initialized");
        const q = query(collection(db, "Transactions"));
        const snap = await getDocs(q);
        const rows: Tx[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        rows.sort((a, b) => {
          const at = (a.createdAt as any)?.toMillis?.() || (a.createdAt ? (a.createdAt as any).seconds * 1000 : 0);
          const bt = (b.createdAt as any)?.toMillis?.() || (b.createdAt ? (b.createdAt as any).seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setItems(rows);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load transactions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (ts?: Timestamp) => ts ? new Date((ts as any).toMillis?.() ?? ts.seconds * 1000).toLocaleString() : "—";
  const formatDateOnly = (ts?: Timestamp) => ts ? new Date((ts as any).toMillis?.() ?? ts.seconds * 1000).toLocaleDateString() : "—";
  const formatAmount = (amt: number | undefined, cur: string | undefined) => `${cur || ""} ${Number(amt || 0).toFixed(2)}`;

  const StatusBadge = ({ status }: { status?: string }) => {
    const s = (status || "").toLowerCase();
    const styles = s === "completed"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : s === "pending"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : s === "refunded"
      ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"; // failed or others
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles}`}>{s || "—"}</span>;
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
          <p className="text-gray-600">View and manage transactions and invoices.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow ring-1 ring-gray-100">
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="text-sm text-gray-600">No transactions found.</div>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700 border-b bg-gray-50/60">
                    <th className="py-3 pr-4 font-semibold">Date</th>
                    <th className="py-3 pr-4 font-semibold">User Name</th>
                    <th className="py-3 pr-4 font-semibold">Package Name</th>
                    <th className="py-3 pr-4 font-semibold">Amount</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 pr-0 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(tx => (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-emerald-50/40">
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-800">{formatDateOnly(tx.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            {String((tx.userName || tx.email || tx.userId || "?")).slice(0,1).toUpperCase()}
                          </span>
                          <div className="text-gray-800">{tx.userName || tx.email || tx.userId || "—"}</div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-sky-50 text-sky-700 ring-1 ring-sky-200">{tx.packageKey || "pkg"}</span>
                          <span className="text-gray-700">{tx.packageTitle || "—"}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-900">{formatAmount(tx.amount, tx.currency)}</td>
                      <td className="py-3 pr-4"><StatusBadge status={tx.status} /></td>
                      <td className="py-3 pl-4 pr-0 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(tx)}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white shadow hover:bg-emerald-700 active:scale-[.99]"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zm11 3a3 3 0 100-6 3 3 0 000 6z"/></svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-100">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Transaction ID</div>
                    <div className="font-medium text-gray-900 break-all">{selected.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="mt-1"><StatusBadge status={selected.status} /></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">User</div>
                    <div className="font-medium text-gray-900">{selected.userName || selected.email || selected.userId || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="font-medium text-gray-900">{formatDate(selected.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Package</div>
                    <div className="font-medium text-gray-900">{selected.packageTitle || selected.packageKey || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="font-medium text-gray-900">{formatAmount(selected.amount, selected.currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Order ID</div>
                    <div className="font-medium text-gray-900 break-all">{selected.orderId || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Payment Method</div>
                    <div className="font-medium text-gray-900 capitalize">{selected.paymentMethod || "—"}</div>
                  </div>
                  {selected.paymentIntentId && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500">Payment Intent ID</div>
                      <div className="font-medium text-gray-900 break-all">{selected.paymentIntentId}</div>
                    </div>
                  )}
                  {selected.packageDetails && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500">Package Details</div>
                      <pre className="mt-1 whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 text-xs text-gray-800 ring-1 ring-gray-100">
{JSON.stringify(selected.packageDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
