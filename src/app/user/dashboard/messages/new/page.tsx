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

interface UserMsgItem {
  id: string;
  packageName?: string | null;
  userName?: string | null;
  userId?: string | null;
  createdAt?: Timestamp | null;
  country?: string | null;
  message: string;
}

export default function UserNewMessagePage() {
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
  const [message, setMessage] = React.useState<string>("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const [previous, setPrevious] = React.useState<UserMsgItem[]>([]);

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUid(u?.uid ?? null);
      setDisplayName(u?.displayName || u?.email || null);
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

  // Load previous messages sent by user
  const reloadMessages = React.useCallback(async () => {
    if (!db || !uid) return;
    const q1 = query(collection(db, "UserMessage"), where("userId", "==", uid));
    const snap = await getDocs(q1);
    const list: UserMsgItem[] = snap.docs.map((d) => ({
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
    setPrevious(list);
  }, [uid]);

  React.useEffect(() => {
    reloadMessages().catch(() => {});
  }, [reloadMessages]);

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
        setError("Please select a package.");
        return;
      }
      const txt = message.trim();
      if (!txt) {
        setError("Please write a message.");
        return;
      }
      setSending(true);
      // Find selected transaction
      const tx = packages.find((p) => p.id === selectedId);
      let packageName = tx?.packageTitle || tx?.packageKey || null;
      let country = tx?.country || null;
      // In case not in memory, fetch the doc (edge case)
      if (!packageName || !country) {
        try {
          const snap = await getDoc(
            doc(collection(db, "Transactions"), selectedId)
          );
          if (snap.exists()) {
            const data = snap.data() as any;
            packageName =
              packageName || data.packageTitle || data.packageKey || null;
            country = country || data.country || null;
          }
        } catch {}
      }
      const payload: any = {
        packageName: packageName || "",
        userName: displayName || "",
        userId: uid,
        createdAt: Timestamp.now(),
        country: country || null,
        message: txt,
      };
      await addDoc(collection(db, "UserMessage"), payload);
      setSuccess("Message sent.");
      setMessage("");
      await reloadMessages();
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
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
          <h1 className="text-2xl font-bold text-gray-900">Send a Message</h1>
          <p className="text-sm text-gray-600">
            Select a purchased package and write your message.
          </p>
        </div>

        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {success && (
          <div className="mb-3 text-sm text-emerald-700">{success}</div>
        )}

        <div className="rounded-2xl bg-white shadow ring-1 ring-gray-100 p-4 sm:p-6">
          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Package</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Select a package…</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.packageTitle || p.packageKey || "Package").toString()}{" "}
                    {p.country ? `• ${p.country}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Write your message here…"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={handleSend}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Previously Sent
          </h2>
          <div className="rounded-2xl bg-white shadow ring-1 ring-gray-100 overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previous.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {m.packageName || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {m.country || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="whitespace-pre-wrap line-clamp-2">
                        {m.message}
                      </div>
                    </td>
                  </tr>
                ))}
                {previous.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No messages yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
