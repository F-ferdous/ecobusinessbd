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

interface MsgItem {
  id: string;
  packageName?: string | null;
  country?: string | null;
  message: string;
  createdAt?: Timestamp | null;
  uploadedByName?: string | null;
  uploadedById?: string | null;
  transactionId?: string | null;
}

export default function AdminMessagesPage() {
  return (
    <UserLayout>
      <MessagesContent />
    </UserLayout>
  );
}

function MessagesContent() {
  const [uid, setUid] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<MsgItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerItem, setViewerItem] = React.useState<MsgItem | null>(null);

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
      if (!db || !(uid || email)) return;
      try {
        setLoading(true);
        setError("");
        const col = collection(db, "AdminMessages");
        let list: MsgItem[] = [];
        try {
          // Prefer userId if AdminMessages stores it; otherwise fall back to userEmail
          const queries = [] as any[];
          if (uid)
            queries.push(getDocs(query(col, where("userId", "==", uid))));
          if (email)
            queries.push(getDocs(query(col, where("userEmail", "==", email))));
          if (queries.length === 0) return;
          const snaps = await Promise.all(queries);
          const rows: MsgItem[] = [];
          for (const s of snaps) {
            s.forEach((d: any) => {
              const data = d.data() as any;
              rows.push({
                id: d.id,
                packageName: data.packageName || null,
                country: data.country || null,
                message: data.message || "",
                createdAt: data.createdAt || null,
                uploadedByName: data.uploadedByName || null,
                uploadedById: data.uploadedById || null,
                transactionId: data.transactionId || null,
              });
            });
          }
          // dedupe by id
          const map = new Map<string, MsgItem>();
          rows.forEach((r) => map.set(r.id, r));
          list = Array.from(map.values());
        } catch (e) {
          list = [];
        }
        list.sort((a: any, b: any) => {
          const at =
            a.createdAt?.toMillis?.() ??
            (a.createdAt ? a.createdAt.seconds * 1000 : 0);
          const bt =
            b.createdAt?.toMillis?.() ??
            (b.createdAt ? b.createdAt.seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setItems(list);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, email]);

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ??
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Messages</h1>
          <p className="text-gray-600">
            Messages sent by admin regarding your packages.
          </p>
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
                    Package
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.packageName || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.country || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateTime(it.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="line-clamp-2">{it.message}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          setViewerItem(it);
                          setViewerOpen(true);
                        }}
                        className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No messages yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewerOpen && viewerItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setViewerOpen(false);
                setViewerItem(null);
              }
            }}
          >
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl">
              <button
                onClick={() => {
                  setViewerOpen(false);
                  setViewerItem(null);
                }}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 border-b">
                <div className="text-lg font-semibold text-gray-900">
                  Message
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {formatDateTime(viewerItem.createdAt)}
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Package</div>
                    <div className="text-gray-900">
                      {viewerItem.packageName || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Country</div>
                    <div className="text-gray-900">
                      {viewerItem.country || "—"}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-xs text-gray-500">Transaction ID</div>
                    <div className="font-mono text-gray-900 break-all">
                      {viewerItem.transactionId || "—"}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t text-sm text-gray-900 whitespace-pre-wrap">
                  {viewerItem.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
