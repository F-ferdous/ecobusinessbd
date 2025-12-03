"use client";

import React from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getApp, initializeApp, deleteApp } from "firebase/app";
import {
  getAuth as getClientAuth,
  createUserWithEmailAndPassword,
  signOut as clientSignOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

interface UserItem {
  id: string;
  email: string;
  displayName?: string | null;
  role?: string | null;
  country?: string | null;
  mobileNumber?: string | null;
  status?: string | null;
  createdAt?: Timestamp | null;
}

export default function AdminUsersPage() {
  const [items, setItems] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<UserItem | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string>("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [addSaving, setAddSaving] = React.useState(false);
  const [addForm, setAddForm] = React.useState({
    displayName: "",
    email: "",
    password: "",
    mobileNumber: "",
  });
  const [addError, setAddError] = React.useState<string>("");
  // Search & pagination
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  // Permissions
  const [currentUid, setCurrentUid] = React.useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = React.useState<string | null>(null);
  const [currentRole, setCurrentRole] = React.useState<string>("");
  const isAdminEmail =
    (currentEmail || "").toLowerCase() === "admin@ecobusinessbd.com";
  const canManage =
    isAdminEmail || (currentRole || "").toLowerCase() === "admin";

  // Edit form state
  const [form, setForm] = React.useState<Partial<UserItem>>({});

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUid(u?.uid ?? null);
      setCurrentEmail(u?.email ?? null);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db) throw new Error("Firestore not initialized");
        setLoading(true);
        setError("");
        // Load current role if signed in
        if (currentUid) {
          try {
            const { doc: fsDoc, getDoc } = await import("firebase/firestore");
            const snap = await getDoc(fsDoc(db, "Users", currentUid));
            const data = snap.exists() ? (snap.data() as any) : {};
            const r = data?.role || data?.Role || "" || "";
            if (!cancelled) setCurrentRole(String(r || ""));
          } catch {}
        }
        const qUsers = query(collection(db, "Users"), orderBy("createdAt"));
        const snap = await getDocs(qUsers);
        const list: UserItem[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            email: data.email || "",
            displayName: data.displayName ?? null,
            role: data.role || data.Role || null,
            country: data.country || null,
            mobileNumber: data.mobileNumber || data.phone || null,
            status: data.status || null,
            createdAt: (data.createdAt as Timestamp) || null,
          };
        });
        // Newest first by createdAt
        list.sort((a, b) => {
          const at =
            (a.createdAt as any)?.toMillis?.() ||
            (a.createdAt ? (a.createdAt as any).seconds * 1000 : 0);
          const bt =
            (b.createdAt as any)?.toMillis?.() ||
            (b.createdAt ? (b.createdAt as any).seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setItems(list);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUid]);

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ??
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
  };

  // Derived processed list
  const processed = React.useMemo(() => {
    const norm = (s: any) => (s ?? "").toString().toLowerCase();
    let list = items;
    if (search.trim()) {
      const q = norm(search.trim());
      list = list.filter(
        (u) =>
          norm(u.displayName).includes(q) ||
          norm(u.email).includes(q) ||
          norm(u.role).includes(q) ||
          norm(u.mobileNumber).includes(q)
      );
    }
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const rows = list.slice(start, start + pageSize);
    return { total, totalPages, currentPage, rows };
  }, [items, search, page, pageSize]);

  // Reset page when search or pageSize changes
  React.useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              {canManage ? "View, create, edit, or delete users" : "View users"}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setAddForm({
                  displayName: "",
                  email: "",
                  password: "",
                  mobileNumber: "",
                });
                setAddError("");
                setAddOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              Add New User
            </button>
          )}
        </div>

        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow ring-1 ring-gray-100">
            {/* Controls */}
            <div className="p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, role or mobile"
                  className="w-full sm:w-[320px] rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Rows</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processed.rows.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {u.displayName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {u.role || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {u.mobileNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelected(u);
                            setViewOpen(true);
                          }}
                          className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        >
                          View
                        </button>
                        {canManage && (
                          <button
                            onClick={() => {
                              setSelected(u);
                              setForm({
                                displayName: u.displayName || "",
                                role: u.role || "",
                                mobileNumber: u.mobileNumber || "",
                              });
                              setEditOpen(true);
                            }}
                            className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                          >
                            Edit
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={async () => {
                              try {
                                if (!db) return;
                                const ok = window.confirm(
                                  "Delete this user record from Firestore?"
                                );
                                if (!ok) return;
                                setDeletingId(u.id);
                                await deleteDoc(
                                  doc(collection(db, "Users"), u.id)
                                );
                                setItems((prev) =>
                                  prev.filter((x) => x.id !== u.id)
                                );
                              } catch (e: unknown) {
                                alert(
                                  e instanceof Error
                                    ? e.message
                                    : "Failed to delete user"
                                );
                              } finally {
                                setDeletingId("");
                              }
                            }}
                            disabled={deletingId === u.id}
                            className="px-2 py-1 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-60"
                          >
                            {deletingId === u.id ? "Deleting…" : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {processed.total === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {processed.total > 0 && (
              <div className="flex items-center justify-between gap-3 p-3 border-t border-gray-100 text-sm">
                <div className="text-gray-600">
                  Page {processed.currentPage} of {processed.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={processed.currentPage <= 1}
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 disabled:opacity-50"
                    onClick={() =>
                      setPage((p) => Math.min(processed.totalPages, p + 1))
                    }
                    disabled={processed.currentPage >= processed.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add user modal */}
        {addOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
              if (!addSaving) setAddOpen(false);
            }}
          >
            <div
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
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
                  Create User
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-3 text-sm">
                {addError && (
                  <div className="text-sm text-rose-600">{addError}</div>
                )}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Name</label>
                  <input
                    value={addForm.displayName}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Mobile</label>
                    <input
                      value={addForm.mobileNumber}
                      onChange={(e) =>
                        setAddForm((f) => ({
                          ...f,
                          mobileNumber: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Role</label>
                    <input
                      value="Manager"
                      disabled
                      className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={async () => {
                      try {
                        setAddError("");
                        if (!addForm.email.trim() || !addForm.password.trim()) {
                          setAddError("Email and password are required");
                          return;
                        }
                        setAddSaving(true);
                        // Create user using a secondary Firebase app to avoid affecting current admin auth session
                        const primary = getApp();
                        const secondary = initializeApp(
                          primary.options,
                          "admin-create"
                        );
                        const auth2 = getClientAuth(secondary);
                        const cred = await createUserWithEmailAndPassword(
                          auth2,
                          addForm.email.trim().toLowerCase(),
                          addForm.password
                        );
                        const uid = cred.user.uid;
                        // Write Firestore Users/{uid}
                        const {
                          doc: fsDoc,
                          setDoc,
                          serverTimestamp,
                        } = await import("firebase/firestore");
                        await setDoc(
                          fsDoc(db, "Users", uid),
                          {
                            email: addForm.email.trim().toLowerCase(),
                            displayName: addForm.displayName.trim(),
                            role: "Manager",
                            mobileNumber: addForm.mobileNumber.trim(),
                            status: "active",
                            password: addForm.password, // stored as entered
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                          },
                          { merge: true }
                        );
                        // Sign out secondary auth and clean up secondary app
                        try {
                          await clientSignOut(auth2);
                        } catch {}
                        try {
                          await deleteApp(secondary);
                        } catch {}
                        // Append to table optimistically
                        setItems((prev) => [
                          {
                            id: uid,
                            email: addForm.email.trim().toLowerCase(),
                            displayName: addForm.displayName.trim(),
                            role: "Manager",
                            mobileNumber: addForm.mobileNumber.trim(),
                            status: "active",
                            createdAt: null,
                          },
                          ...prev,
                        ]);
                        setAddOpen(false);
                      } catch (e: any) {
                        setAddError(e?.message || "Failed to create user");
                      } finally {
                        setAddSaving(false);
                      }
                    }}
                    disabled={addSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {addSaving ? "Creating…" : "Create"}
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
            onClick={() => {
              setViewOpen(false);
              setSelected(null);
            }}
          >
            <div
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setViewOpen(false);
                  setSelected(null);
                }}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-white">
                <div className="text-lg font-semibold text-gray-900">
                  User Details
                </div>
                <div className="text-sm text-gray-600">{selected.email}</div>
              </div>
              <div className="p-5 sm:p-6 space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {selected.displayName || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {selected.role || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Country:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {selected.country || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Mobile:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {selected.mobileNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {selected.status || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {formatDateTime(selected.createdAt)}
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
            onClick={() => {
              if (!saving) {
                setEditOpen(false);
                setSelected(null);
              }
            }}
          >
            <div
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  if (!saving) {
                    setEditOpen(false);
                    setSelected(null);
                  }
                }}
                aria-label="Close"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-sky-50 to-white">
                <div className="text-lg font-semibold text-gray-900">
                  Edit User
                </div>
                <div className="text-sm text-gray-600">{selected.email}</div>
              </div>
              <div className="p-5 sm:p-6 space-y-3 text-sm">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Name</label>
                  <input
                    value={form.displayName as any}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Role</label>
                  <input
                    value={form.role as any}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Country</label>
                  <input
                    value={form.country as any}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, country: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Mobile</label>
                  <input
                    value={form.mobileNumber as any}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mobileNumber: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Status</label>
                  <input
                    value={form.status as any}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={async () => {
                      try {
                        if (!db || !selected) return;
                        setSaving(true);
                        const payload: any = {
                          displayName: form.displayName ?? "",
                          role: form.role ?? "",
                          country: form.country ?? "",
                          mobileNumber: form.mobileNumber ?? "",
                          status: form.status ?? "",
                        };
                        await updateDoc(
                          doc(collection(db, "Users"), selected.id),
                          payload
                        );
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === selected.id ? { ...x, ...payload } : x
                          )
                        );
                        setEditOpen(false);
                        setSelected(null);
                      } catch (e: unknown) {
                        alert(
                          e instanceof Error
                            ? e.message
                            : "Failed to update user"
                        );
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save"}
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
