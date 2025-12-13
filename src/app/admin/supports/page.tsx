"use client";

import React from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  addDoc,
} from "firebase/firestore";

interface TicketItem {
  id: string;
  ticketNo: string;
  packageName?: string | null;
  country?: string | null;
  userId: string;
  userName?: string | null;
  createdAt?: Timestamp | null;
  status?: string | null; // open | closed
  message?: string | null; // initial message
}

interface FeedbackItemPayload {
  adminName?: string | null;
  message: string;
  createdAt: Timestamp;
}

export default function AdminSupportsPage() {
  return <SectionContent />;
}

function SectionContent() {
  const [email, setEmail] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setEmail(u?.email ?? null));
    return () => unsub();
  }, []);

  const [items, setItems] = React.useState<TicketItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<string>("all"); // all | open | closed
  const [search, setSearch] = React.useState<string>("");

  // Reply modal
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyTicket, setReplyTicket] = React.useState<TicketItem | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [replySending, setReplySending] = React.useState(false);
  const [replyError, setReplyError] = React.useState<string>("");
  const [replySuccess, setReplySuccess] = React.useState<string>("");
  const [closingId, setClosingId] = React.useState<string | null>(null);

  const loadTickets = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    setError("");
    try {
      const col = collection(db, "SupportTickets");
      // Fetch all then filter client-side to keep UI simple
      const q1 = query(col);
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
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTickets().catch(() => {});
  }, [loadTickets]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((it) => {
      const statusOk =
        statusFilter === "all" ||
        (it.status || "open").toLowerCase() === statusFilter;
      const termOk =
        !term ||
        [
          it.ticketNo || "",
          it.packageName || "",
          it.userName || "",
          it.country || "",
        ].some((v) => v.toLowerCase().includes(term));
      return statusOk && termOk;
    });
  }, [items, statusFilter, search]);

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ??
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  const closeTicket = async (ticket: TicketItem) => {
    try {
      if (!db) return;
      setClosingId(ticket.id);
      const ref = doc(collection(db, "SupportTickets"), ticket.id);
      await updateDoc(ref, { status: "closed" });
      setItems((prev) =>
        prev.map((it) =>
          it.id === ticket.id ? { ...it, status: "closed" } : it
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setClosingId(null);
    }
  };

  const openReply = (ticket: TicketItem) => {
    setReplyTicket(ticket);
    setReplyText("");
    setReplyError("");
    setReplySuccess("");
    setReplyOpen(true);
  };

  const sendReply = async () => {
    try {
      if (!db || !replyTicket) return;
      const txt = replyText.trim();
      if (!txt) {
        setReplyError("Please write a reply.");
        return;
      }
      setReplySending(true);
      setReplyError("");
      setReplySuccess("");
      const fbCol = collection(
        doc(collection(db, "SupportTickets"), replyTicket.id),
        "Feedback"
      );
      const payload: FeedbackItemPayload = {
        adminName: email || "Admin",
        message: txt,
        createdAt: Timestamp.now(),
      };
      await addDoc(fbCol, payload);
      setReplySuccess("Reply sent.");
      setReplyText("");
    } catch (e: any) {
      setReplyError(e?.message || "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  return (
    <section className="py-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supports</h1>
          <p className="text-sm text-gray-600">
            View and reply to user support tickets.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket no, project, name, country"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-full sm:w-80"
          />
          <button
            onClick={() => loadTickets()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            Refresh
          </button>
        </div>
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
                  User
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
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {t.ticketNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {t.userName || "—"}
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
                        (t.status || "").toLowerCase() === "closed"
                          ? "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      }`}
                    >
                      {t.status || "open"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => openReply(t)}
                      className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                    >
                      Reply
                    </button>
                    {(t.status || "open").toLowerCase() !== "closed" && (
                      <button
                        onClick={() => closeTicket(t)}
                        disabled={closingId === t.id}
                        className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-60"
                      >
                        {closingId === t.id ? "Closing…" : "Close"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {replyOpen && replyTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setReplyOpen(false);
              setReplyTicket(null);
              setReplyText("");
              setReplyError("");
              setReplySuccess("");
            }
          }}
        >
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                setReplyOpen(false);
                setReplyTicket(null);
                setReplyText("");
                setReplyError("");
                setReplySuccess("");
              }}
              aria-label="Close"
              className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              ✕
            </button>
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-white border-b">
              <div className="text-sm text-gray-600">Reply to Ticket</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {replyTicket.ticketNo} • {replyTicket.packageName || "—"}
              </div>
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              {replyError && (
                <div className="text-sm text-rose-600">{replyError}</div>
              )}
              {replySuccess && (
                <div className="text-sm text-emerald-700">{replySuccess}</div>
              )}
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Message</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Write your reply to the user…"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={sendReply}
                  disabled={replySending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                >
                  {replySending ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
