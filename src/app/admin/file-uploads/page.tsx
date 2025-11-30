"use client";

import React from "react";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Types for Users and Transactions
interface UserItem {
  id: string;
  email: string;
  displayName?: string | null;
}

interface TransactionItem {
  id: string;
  userId?: string | null;
  email?: string | null;
  packageTitle?: string | null; // fallbacks if present
  packageName?: string | null; // prefer this if exists
  country?: string | null;
}

export default function AdminFileUploadsPage() {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = React.useState<boolean>(true);
  const [userSearch, setUserSearch] = React.useState<string>("");
  const [selectedUser, setSelectedUser] = React.useState<UserItem | null>(null);

  const [txs, setTxs] = React.useState<TransactionItem[]>([]);
  const [txsLoading, setTxsLoading] = React.useState<boolean>(false);
  const [selectedTxId, setSelectedTxId] = React.useState<string>("");

  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [message, setMessage] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [url, setUrl] = React.useState<string>("");

  // Load users
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db) throw new Error("Firestore not initialized");
        setUsersLoading(true);
        const qUsers = query(
          collection(db, "Users"),
          orderBy("displayName"),
          limit(200)
        );
        const snap = await getDocs(qUsers);
        const list: UserItem[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            email: data.email || "",
            displayName: data.displayName ?? null,
          };
        });
        if (!cancelled) setUsers(list);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load users");
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load transactions for selected user
  const loadTransactions = React.useCallback(async (u: UserItem) => {
    setTxsLoading(true);
    setTxs([]);
    setSelectedTxId("");
    setError("");
    try {
      if (!db) throw new Error("Firestore not initialized");
      const txsCol = collection(db, "Transactions");

      // Try by userId first, then fallback to email
      const results: TransactionItem[] = [];
      try {
        const qById = query(txsCol, where("userId", "==", u.id));
        const snapId = await getDocs(qById);
        snapId.forEach((d) => results.push({ id: d.id, ...(d.data() as any) }));
      } catch (_) {}

      if (results.length === 0 && u.email) {
        try {
          const qByEmail = query(
            txsCol,
            where("email", "==", (u.email || "").toLowerCase())
          );
          const snapEmail = await getDocs(qByEmail);
          snapEmail.forEach((d) =>
            results.push({ id: d.id, ...(d.data() as any) })
          );
        } catch (_) {}
      }

      // Basic sort by createdAt desc if present
      results.sort((a: any, b: any) => {
        const at =
          a.createdAt?.toMillis?.() ??
          (a.createdAt ? a.createdAt.seconds * 1000 : 0);
        const bt =
          b.createdAt?.toMillis?.() ??
          (b.createdAt ? b.createdAt.seconds * 1000 : 0);
        return bt - at;
      });

      setTxs(results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load packages");
    } finally {
      setTxsLoading(false);
    }
  }, []);

  const filteredUsers = React.useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  const selectedTx = React.useMemo(
    () => txs.find((t) => t.id === selectedTxId) || null,
    [txs, selectedTxId]
  );

  const onChooseUser = (u: UserItem) => {
    setSelectedUser(u);
    loadTransactions(u);
    setMessage("");
    setError("");
  };

  const handleUpload = async () => {
    try {
      setMessage("");
      setError("");
      if (!selectedUser) throw new Error("Please select a user.");
      if (!selectedTx) throw new Error("Please select a package.");
      if (!file) throw new Error("Please choose a file to upload.");
      if (!storage) throw new Error("Firebase storage not initialized");
      if (!db) throw new Error("Firestore not initialized");

      const filePath = `uploads/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, filePath);

      setUploading(true);
      setProgress(0);

      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUrl(downloadURL);
      setProgress(100);

      const pkgName = (
        selectedTx.packageName ||
        selectedTx.packageTitle ||
        ""
      ).toString();
      const country = (selectedTx.country || "").toString();

      await addDoc(collection(db, "AdminUploads"), {
        userName: selectedUser.displayName || "",
        packageName: pkgName,
        country,
        transactionId: selectedTx.id,
        fileUrl: downloadURL,
        filePath: filePath,
        uploadTime: serverTimestamp(),
        userEmail: (selectedUser.email || "").toLowerCase(),
      });

      setMessage("File uploaded and saved successfully.");
      setFile(null);
      setProgress(0);
      setUploading(false);
    } catch (e: unknown) {
      setUploading(false);
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Admin File Upload
          </h1>
          <Link
            href="/admin/file-uploads/list"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-100"
          >
            List of Uploads
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: User selection */}
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Select User
              </h2>
              {usersLoading && (
                <span className="text-xs text-gray-500">Loading users…</span>
              )}
            </div>
            <div className="mt-4">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const active = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => onChooseUser(u)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition ${
                      active ? "bg-emerald-50" : ""
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {u.displayName || "Untitled User"}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </button>
                );
              })}
              {!usersLoading && filteredUsers.length === 0 && (
                <div className="text-sm text-gray-500 px-3 py-6">
                  No users found.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Package selection and upload */}
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Package & Upload
              </h2>
              {txsLoading && (
                <span className="text-xs text-gray-500">Loading packages…</span>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchased Package
                </label>
                <select
                  disabled={!selectedUser || txsLoading}
                  value={selectedTxId}
                  onChange={(e) => setSelectedTxId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white disabled:opacity-60"
                >
                  <option value="">
                    {!selectedUser
                      ? "Select a user first"
                      : txs.length
                      ? "Select a package"
                      : "No packages found"}
                  </option>
                  {txs.map((t) => {
                    const label = `${(
                      t.packageName ||
                      t.packageTitle ||
                      "Unnamed Package"
                    ).toString()}${t.country ? ` — ${t.country}` : ""}`;
                    return (
                      <option key={t.id} value={t.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File
                </label>
                <input
                  type="file"
                  disabled={!selectedUser || !selectedTxId || uploading}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-60"
                />
              </div>

              {uploading && (
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpload}
                  disabled={
                    !selectedUser || !selectedTxId || !file || uploading
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload File"}
                </button>
                {message && (
                  <span className="text-sm text-emerald-700">{message}</span>
                )}
                {error && (
                  <span className="text-sm text-rose-600">{error}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
