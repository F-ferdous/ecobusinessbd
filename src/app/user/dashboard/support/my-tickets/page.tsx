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
  doc,
} from "firebase/firestore";

interface TicketItem {
  id: string;
  ticketNo: string;
  packageName?: string | null;
  country?: string | null;
  userId: string;
  userName?: string | null;
  createdAt?: Timestamp | null;
  status?: string | null;
  message?: string | null;
}

interface FeedbackItem {
  id: string;
  adminName?: string | null;
  message: string;
  createdAt?: Timestamp | null;
}

export default function MyTicketsPage() {
  return (
    <UserLayout>
      <SectionContent />
    </UserLayout>
  );
}

function SectionContent() {
  const [uid, setUid] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [items, setItems] = React.useState<TicketItem[]>([]);

  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerTicket, setViewerTicket] = React.useState<TicketItem | null>(
    null
  );
  const [fbLoading, setFbLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackItem[]>([]);
  const [fbError, setFbError] = React.useState<string>("");

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
        const q1 = query(
          collection(db, "SupportTickets"),
          where("userId", "==", uid)
        );
        const snap = await getDocs(q1);
        const list: TicketItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
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
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load tickets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ??
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  const openFeedback = async (ticket: TicketItem) => {
    try {
      if (!db) return;
      setViewerTicket(ticket);
      setViewerOpen(true);
      setFbLoading(true);
      setFbError("");
      setFeedback([]);
      const fbCol = collection(
        doc(collection(db, "SupportTickets"), ticket.id),
        "Feedback"
      );
      const snap = await getDocs(fbCol);
      const rows: FeedbackItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      rows.sort((a: any, b: any) => {
        const at =
          a.createdAt?.toMillis?.() ??
          (a.createdAt ? a.createdAt.seconds * 1000 : 0);
        const bt =
          b.createdAt?.toMillis?.() ??
          (b.createdAt ? b.createdAt.seconds * 1000 : 0);
        return at - bt; // chronological
      });
      setFeedback(rows);
    } catch (e: any) {
      setFbError(e?.message || "Failed to load feedback");
    } finally {
      setFbLoading(false);
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-sm text-gray-600">
            View your support tickets and admin feedback.
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
                    Ticket No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {t.ticketNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {t.packageName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {t.country || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                          (t.status || "").toLowerCase() === "open"
                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        }`}
                      >
                        {t.status || "open"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => openFeedback(t)}
                        className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                      >
                        Feedback
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No tickets yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewerOpen && viewerTicket && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setViewerOpen(false);
                setViewerTicket(null);
                setFeedback([]);
                setFbError("");
              }
            }}
          >
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
              <button
                onClick={() => {
                  setViewerOpen(false);
                  setViewerTicket(null);
                  setFeedback([]);
                  setFbError("");
                }}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-50 to-white border-b">
                <div className="text-sm text-gray-600">Ticket</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {viewerTicket.ticketNo} • {viewerTicket.packageName || "—"}
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                {fbLoading && (
                  <div className="text-sm text-gray-600">Loading feedback…</div>
                )}
                {fbError && (
                  <div className="text-sm text-rose-600">{fbError}</div>
                )}
                {!fbLoading && !fbError && feedback.length === 0 && (
                  <div className="text-sm text-gray-600">No feedback yet.</div>
                )}
                {!fbLoading && !fbError && feedback.length > 0 && (
                  <div className="space-y-3">
                    {feedback.map((f) => (
                      <div
                        key={f.id}
                        className="rounded-xl border border-gray-200 p-3"
                      >
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{f.adminName || "Admin"}</span>
                          <span>{formatDateTime(f.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {f.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
