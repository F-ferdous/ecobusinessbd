"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

interface TxItem {
  id: string;
  packageTitle?: string | null;
  packageKey?: string | null;
  country?: string | null;
}

interface TicketItem {
  id: string;
  ticketNo: string;
  packageName?: string | null;
  country?: string | null;
  userId: string;
  userName?: string | null;
  createdAt?: Timestamp | null;
  status?: string; // open | closed
  message: string;
  transactionId?: string | null;
}

export default function CreateTicketPage() {
  return (
    <UserLayout>
      <SectionContent />
    </UserLayout>
  );
}

function SectionContent() {
  const [uid, setUid] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  const [packages, setPackages] = React.useState<TxItem[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [otherTitle, setOtherTitle] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const [nextSeq, setNextSeq] = React.useState<number>(1);

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUid(u?.uid ?? null);
      const name = u?.displayName || u?.email || "";
      setDisplayName(name);
    });
    return () => unsub();
  }, []);

  // Load purchased packages (Transactions)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db || !uid) return;
        const q1 = query(
          collection(db, "Transactions"),
          where("userId", "==", uid)
        );
        const snap = await getDocs(q1);
        const rows: TxItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        if (!cancelled) setPackages(rows);
      } catch (e) {
        if (!cancelled) setPackages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Load user's existing tickets to compute next sequence
  const reloadTickets = React.useCallback(async () => {
    if (!db || !uid) return;
    const q1 = query(
      collection(db, "SupportTickets"),
      where("userId", "==", uid)
    );
    const snap = await getDocs(q1);
    setNextSeq(snap.docs.length + 1);
  }, [uid]);

  React.useEffect(() => {
    reloadTickets().catch(() => {});
  }, [reloadTickets]);

  const initialsPrefix = React.useMemo(() => {
    const name = (displayName || "").toString();
    let base = name;
    if (!base && typeof window !== "undefined") {
      try {
        const email = (auth?.currentUser?.email || "").toString();
        base = email.split("@")[0] || "";
      } catch {}
    }
    const letters = base.replace(/[^a-zA-Z]/g, "").toUpperCase();
    const firstTwo = (letters.slice(0, 2) || "US").padEnd(2, "X");
    return firstTwo;
  }, [displayName]);

  const ticketNo = React.useMemo(() => {
    const seq = Math.max(1, nextSeq);
    const seqStr = seq.toString().padStart(3, "0");
    return `${initialsPrefix}${seqStr}`;
  }, [initialsPrefix, nextSeq]);

  const handleSend = async () => {
    try {
      if (!db) return;
      setError("");
      setSuccess("");
      if (!uid) {
        setError("You must be logged in.");
        return;
      }
      if (!selectedId) {
        setError("Please select a project.");
        return;
      }
      const txt = message.trim();
      if (!txt) {
        setError("Please write your ticket message.");
        return;
      }
      // Resolve selected project details
      let packageName: string | null = null;
      let country: string | null = null;
      let transactionId: string | null = null;
      if (selectedId === "other") {
        if (!otherTitle.trim()) {
          setError("Please enter a project/subject for 'Other'.");
          return;
        }
        packageName = otherTitle.trim();
        country = null;
        transactionId = null;
      } else {
        transactionId = selectedId;
        const tx = packages.find((p) => p.id === selectedId);
        packageName = (tx?.packageTitle || tx?.packageKey || "").toString();
        country = tx?.country || null;
        if (!packageName || !country) {
          try {
            const snap = await getDoc(
              doc(collection(db, "Transactions"), selectedId)
            );
            if (snap.exists()) {
              const data = snap.data() as any;
              packageName =
                packageName || data.packageTitle || data.packageKey || "";
              country = country || data.country || null;
            }
          } catch {}
        }
      }

      setSending(true);
      const payload: any = {
        ticketNo,
        packageName: packageName || "",
        country: country || null,
        userId: uid,
        userName: displayName || "",
        createdAt: Timestamp.now(),
        status: "open",
        message: txt,
        transactionId,
      };
      await addDoc(collection(db, "SupportTickets"), payload);
      setSuccess(`Ticket ${ticketNo} created.`);
      setMessage("");
      setOtherTitle("");
      setSelectedId("");
      await reloadTickets();
    } catch (e: any) {
      setError(e?.message || "Failed to create ticket");
    } finally {
      setSending(false);
    }
  };

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ??
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  return (
    <section className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Support Ticket
          </h1>
          <p className="text-sm text-gray-600">
            Select a purchased project or choose Other, write your message, and
            send.
          </p>
        </div>

        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {success && (
          <div className="mb-3 text-sm text-emerald-700">{success}</div>
        )}

        <div className="rounded-2xl bg-white shadow ring-1 ring-gray-100 p-4 sm:p-6">
          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Project</label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select a project…</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p.packageTitle || p.packageKey || "Project").toString()}{" "}
                      {p.country ? `• ${p.country}` : ""}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">
                  Ticket Number
                </label>
                <input
                  value={ticketNo}
                  readOnly
                  className="rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-800 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            {selectedId === "other" && (
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">
                  Other Project / Subject
                </label>
                <input
                  value={otherTitle}
                  onChange={(e) => setOtherTitle(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Enter a project/subject name"
                />
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Describe your issue or request…"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={handleSend}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              >
                {sending ? "Creating…" : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>

        {/* My Tickets listing moved to /user/dashboard/support/my-tickets */}
      </div>
    </section>
  );
}
