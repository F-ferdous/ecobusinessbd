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
import Link from "next/link";

interface MsgItem {
  id: string;
  packageName?: string | null;
  country?: string | null;
  message: string;
  createdAt?: Timestamp | null;
}

export default function UserMessagesListPage() {
  return (
    <UserLayout>
      <SectionContent />
    </UserLayout>
  );
}

function SectionContent() {
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
        const queries = [] as any[];
        if (uid) queries.push(getDocs(query(col, where("userId", "==", uid))));
        if (email)
          queries.push(getDocs(query(col, where("userEmail", "==", email))));
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
            });
          });
        }
        const list = Array.from(new Map(rows.map((r) => [r.id, r])).values());
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">
              Messages sent by admin regarding your packages.
            </p>
          </div>
          <Link
            href="/user/dashboard/messages/new"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            Send Message
          </Link>
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
                      <div className="line-clamp-2 whitespace-pre-wrap">
                        {it.message}
                      </div>
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
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
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
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-white border-b">
                <div className="text-sm text-gray-600">Package</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {viewerItem.packageName || "Service Package"}
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="text-sm font-semibold text-emerald-700 mb-2">
                    Message
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {viewerItem.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
