"use client";

import React from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const cards = [
  {
    label: "Registered Users",
    color: "emerald",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 14a4 4 0 10-8 0v2H5a3 3 0 00-3 3v1h20v-1a3 3 0 00-3-3h-3v-2zM12 12a4 4 0 100-8 4 4 0 000 8z"
        />
      </svg>
    ),
  },
  {
    label: "USA Packages Purchased",
    color: "sky",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4"
        />
      </svg>
    ),
  },
  {
    label: "UK Packages Purchased",
    color: "indigo",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    label: "Courses Listed",
    color: "violet",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20l9-5-9-5-9 5 9 5z M12 10l9-5-9-5-9 5 9 5z"
        />
      </svg>
    ),
  },
  {
    label: "User Queries",
    color: "amber",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h8M8 14h5M21 12a9 9 0 11-6.219-8.56"
        />
      </svg>
    ),
  },
];

const colorMap: Record<
  string,
  { bg: string; ring: string; chipBg: string; chipFg: string }
> = {
  emerald: {
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    chipBg: "bg-emerald-100",
    chipFg: "text-emerald-700",
  },
  sky: {
    bg: "bg-sky-50",
    ring: "ring-sky-100",
    chipBg: "bg-sky-100",
    chipFg: "text-sky-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    ring: "ring-indigo-100",
    chipBg: "bg-indigo-100",
    chipFg: "text-indigo-700",
  },
  violet: {
    bg: "bg-violet-50",
    ring: "ring-violet-100",
    chipBg: "bg-violet-100",
    chipFg: "text-violet-700",
  },
  amber: {
    bg: "bg-amber-50",
    ring: "ring-amber-100",
    chipBg: "bg-amber-100",
    chipFg: "text-amber-700",
  },
};

type Tx = {
  id: string;
  userId?: string;
  email?: string | null;
  userName?: string | null;
  packageKey?: string | null;
  packageTitle?: string | null;
  country?: string | null;
  status?: string | null;
  createdAt?: Timestamp;
};

type PendingOrder = {
  id: string;
  userId: string;
  packageName: string;
  country?: string | null;
  status: string; // pending|completed
  totalAmount?: number;
  createdAt?: Timestamp;
  transactionId?: string;
};

const StatusBadge = ({ status }: { status?: string | null }) => {
  const s = (status || "").toLowerCase();
  const styles =
    s === "completed"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : s === "pending"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles}`}>
      {s || "—"}
    </span>
  );
};

const formatDateOnly = (ts?: Timestamp) =>
  ts
    ? new Date(
        (ts as any).toMillis?.() ?? (ts as any).seconds * 1000
      ).toLocaleDateString()
    : "—";

function AdminDashboardInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") || "all").toLowerCase();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [items, setItems] = React.useState<Tx[]>([]);
  const [selected, setSelected] = React.useState<Tx | null>(null);
  const [userNameMap, setUserNameMap] = React.useState<Record<string, string>>(
    {}
  );
  // Pending Orders state
  const [pendingItems, setPendingItems] = React.useState<PendingOrder[]>([]);
  const [selectedPending, setSelectedPending] =
    React.useState<PendingOrder | null>(null);
  const [selectedTx, setSelectedTx] = React.useState<Tx | null>(null);
  // UI state: filtering, search, sorting, pagination
  const [nameFilter, setNameFilter] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<
    "date" | "name" | "status" | "package"
  >("date");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!db) return;
        setLoading(true);
        setError("");
        if (status === "pending") {
          // Clear transactions list to avoid any flicker of old data
          setItems([]);
          // Load from PendingOrders collection (contains only pending)
          const snap = await getDocs(collection(db, "PendingOrders"));
          let rows: PendingOrder[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          rows.sort((a, b) => {
            const at =
              (a.createdAt as any)?.toMillis?.() ||
              (a.createdAt ? (a.createdAt as any).seconds * 1000 : 0);
            const bt =
              (b.createdAt as any)?.toMillis?.() ||
              (b.createdAt ? (b.createdAt as any).seconds * 1000 : 0);
            return bt - at;
          });
          if (!cancelled) setPendingItems(rows);
          const ids = Array.from(
            new Set(rows.map((r) => r.userId).filter(Boolean))
          );
          const missing = ids.filter((id) => !(id in userNameMap));
          if (!cancelled && missing.length > 0) {
            const fetched: Record<string, string> = {};
            await Promise.all(
              missing.map(async (uid) => {
                try {
                  // 1) Try direct doc by uid
                  const ref = doc(db, "Users", uid);
                  let snap = await getDoc(ref);
                  let data: any = snap.exists() ? (snap.data() as any) : null;
                  if (!data) {
                    // 2) Try query by uid field
                    const { getDocs, collection, query, where } = await import(
                      "firebase/firestore"
                    );
                    const usersCol = collection(db, "Users");
                    let q = query(usersCol, where("uid", "==", uid));
                    let qSnap = await getDocs(q);
                    if (qSnap.empty) {
                      // No email available in pending block; skip email lookup
                    } else {
                      data = (qSnap.docs[0].data() as any) || null;
                    }
                  }
                  const dn = (data?.displayName || "").toString().trim();
                  if (dn) fetched[uid] = dn;
                } catch {}
              })
            );
            if (!cancelled && Object.keys(fetched).length > 0) {
              setUserNameMap((prev) => ({ ...prev, ...fetched }));
            }
          }
        } else {
          // Clear pending list when not viewing pending
          setPendingItems([]);
          // Load from Transactions for all/completed
          const base = collection(db, "Transactions");
          const q =
            status === "all"
              ? query(base)
              : query(base, where("status", "==", status));
          const snap = await getDocs(q);
          let rows: Tx[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          // Filter to only our purchase flow transactions to prevent unrelated docs inflating counts
          rows = rows.filter((r: any) => {
            const hasPkg = !!(r.packageTitle || r.packageKey || r.packageName);
            const c = (r.country || "").toString().toUpperCase();
            const validCountry = c === "USA" || c === "UK" || c === "CUSTOM";
            return hasPkg && validCountry;
          });
          rows.sort((a, b) => {
            const at =
              (a.createdAt as any)?.toMillis?.() ||
              (a.createdAt ? (a.createdAt as any).seconds * 1000 : 0);
            const bt =
              (b.createdAt as any)?.toMillis?.() ||
              (b.createdAt ? (b.createdAt as any).seconds * 1000 : 0);
            return bt - at;
          });
          if (!cancelled) setItems(rows);
          // After items load, fetch display names for unique userIds
          const ids = Array.from(
            new Set(rows.map((r) => r.userId).filter(Boolean))
          ) as string[];
          const missing = ids.filter((id) => !(id in userNameMap));
          if (!cancelled && missing.length > 0) {
            const fetched: Record<string, string> = {};
            await Promise.all(
              missing.map(async (uid) => {
                try {
                  const ref = doc(db, "Users", uid);
                  const snap = await getDoc(ref);
                  const data = snap.exists() ? (snap.data() as any) : {};
                  const dnRaw =
                    data?.displayName ||
                    data?.name ||
                    data?.Name ||
                    data?.fullName ||
                    (data?.firstName || data?.lastName
                      ? `${data?.firstName || ""} ${
                          data?.lastName || ""
                        }`.trim()
                      : "");
                  const dn = (dnRaw || "").toString().trim();
                  if (dn) fetched[uid] = dn;
                } catch {}
              })
            );
            if (!cancelled && Object.keys(fetched).length > 0) {
              setUserNameMap((prev) => ({ ...prev, ...fetched }));
            }
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Reset to first page when filters/search/sort change
  React.useEffect(() => {
    setPage(1);
  }, [nameFilter, search, sortBy, sortDir, status, pageSize]);

  // Prepare processed rows
  const processed = React.useMemo(() => {
    const sourceRows = status === "pending" ? pendingItems : items;
    const rows = sourceRows.map((r: any) => ({
      ...r,
      displayName: userNameMap[r.userId || ""] || r.userName || "",
      packageDisplay:
        (r as any).packageTitle ||
        (r as any).packageKey ||
        (r as any).packageName ||
        "",
    }));
    const norm = (s: string) => (s || "").toString().toLowerCase();
    let filtered = rows;
    if (nameFilter.trim()) {
      const nf = norm(nameFilter.trim());
      filtered = filtered.filter((r) => norm(r.displayName).startsWith(nf));
    }
    if (search.trim()) {
      const q = norm(search.trim());
      filtered = filtered.filter(
        (r) =>
          norm(r.displayName).includes(q) ||
          norm((r as any).email || "").includes(q)
      );
    }
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        const at =
          (a.createdAt as any)?.toMillis?.() ||
          (a.createdAt ? (a.createdAt as any).seconds * 1000 : 0);
        const bt =
          (b.createdAt as any)?.toMillis?.() ||
          (b.createdAt ? (b.createdAt as any).seconds * 1000 : 0);
        cmp = at - bt;
      } else if (sortBy === "name") {
        cmp = (a.displayName || "").localeCompare(
          b.displayName || "",
          undefined,
          { sensitivity: "base" }
        );
      } else if (sortBy === "status") {
        cmp = ((a as any).status || "").localeCompare(
          (b as any).status || "",
          undefined,
          { sensitivity: "base" }
        );
      } else if (sortBy === "package") {
        cmp = (a.packageDisplay || "")
          .toString()
          .localeCompare((b.packageDisplay || "").toString(), undefined, {
            sensitivity: "base",
          });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return { total, totalPages, currentPage, rows: sorted.slice(start, end) };
  }, [
    status,
    pendingItems,
    items,
    userNameMap,
    nameFilter,
    search,
    sortBy,
    sortDir,
    page,
    pageSize,
  ]);

  return (
    <section key={status} className="py-4">
      {/* Orders table shown when using Sales Dashboard options */}
      <div className="mb-6">
        <div className="mb-3">
          <h1 className="text-xl font-semibold text-gray-900">
            {status === "pending" && "Pending Orders"}
            {status === "completed" && "Completed Orders"}
            {status === "all" && "All Orders"}
          </h1>
          <p className="text-sm text-gray-600">List of purchase packages</p>
        </div>

        {/* Controls: filter, search, sort, page size */}
        <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Filter by Name</label>
            <input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="e.g. John"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">
              Search (Name or Email)
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Search..."
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm flex-1"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
                <option value="package">Package</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                title={`Sort ${sortDir === "asc" ? "ascending" : "descending"}`}
              >
                {sortDir === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Rows per page</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        {/* Details Modal */}
        {selected && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelected(null)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-100">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">User</div>
                      <div className="font-medium text-gray-900">
                        {userNameMap[selected.userId || ""] ||
                          selected.userName ||
                          selected.email ||
                          selected.userId ||
                          "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="mt-1">
                        <StatusBadge status={selected.status} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Package</div>
                      <div className="font-medium text-gray-900">
                        {selected.packageTitle || selected.packageKey || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Country</div>
                      <div className="font-medium text-gray-900">
                        {selected.country || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Purchase Date</div>
                      <div className="font-medium text-gray-900">
                        {formatDateOnly(selected.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        Transaction ID
                      </div>
                      <div className="font-mono text-gray-900 break-all">
                        {selected.id}
                      </div>
                    </div>
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

        {/* Details Modal for Pending Orders */}
        {selectedPending && status === "pending" && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setSelectedPending(null);
                setSelectedTx(null);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-100">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pending Order Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPending(null);
                      setSelectedTx(null);
                    }}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">User</div>
                      <div className="font-medium text-gray-900">
                        {userNameMap[selectedPending.userId] || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="mt-1">
                        <StatusBadge status={selectedPending.status} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Package</div>
                      <div className="font-medium text-gray-900">
                        {selectedPending.packageName || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Country</div>
                      <div className="font-medium text-gray-900">
                        {selectedPending.country || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-medium text-gray-900">
                        {formatDateOnly(selectedPending.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        Transaction ID
                      </div>
                      <div className="font-mono text-gray-900 break-all">
                        {selectedPending.transactionId || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Linked Transaction Preview */}
                  {selectedTx && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="text-sm font-semibold text-gray-800 mb-2">
                        Transaction Summary
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div>
                          <span className="text-gray-500">Email:</span>{" "}
                          {selectedTx.email || "—"}
                        </div>
                        <div>
                          <span className="text-gray-500">Package Title:</span>{" "}
                          {selectedTx.packageTitle ||
                            selectedTx.packageKey ||
                            "—"}
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>{" "}
                          {selectedTx.status || "—"}
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>{" "}
                          {formatDateOnly(selectedTx.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => alert("Upload action coming soon")}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Message action coming soon")}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (!selectedPending) return;
                          await (
                            await import("firebase/firestore")
                          ).updateDoc(
                            doc(db, "PendingOrders", selectedPending.id),
                            { status: "completed" }
                          );
                          setPendingItems((prev) =>
                            prev.map((it) =>
                              it.id === selectedPending.id
                                ? { ...it, status: "completed" }
                                : it
                            )
                          );
                          setSelectedPending((prev) =>
                            prev ? { ...prev, status: "completed" } : prev
                          );
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white shadow ring-1 ring-gray-100 p-4">
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
          {!loading && !error && processed.total === 0 && (
            <div className="text-sm text-gray-600">No records found.</div>
          )}
          {!loading && !error && processed.total > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700 border-b bg-gray-50/60">
                    <th className="py-3 pr-4 font-semibold">
                      {status === "pending" ? "Date" : "SL"}
                    </th>
                    <th className="py-3 pr-4 font-semibold">User Name</th>
                    <th className="py-3 pr-4 font-semibold">Package Name</th>
                    <th className="py-3 pr-4 font-semibold">Country</th>
                    {status !== "pending" && (
                      <th className="py-3 pr-4 font-semibold">Purchase Date</th>
                    )}
                    {status !== "pending" && (
                      <th className="py-3 pr-4 font-semibold">Status</th>
                    )}
                    {status === "pending" && (
                      <th className="py-3 pr-0 font-semibold text-right">
                        Action
                      </th>
                    )}
                    {status !== "pending" && (
                      <th className="py-3 pr-0 font-semibold text-right">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {processed.rows.map((row: any, idx: number) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-0 hover:bg-emerald-50/40 cursor-pointer"
                      onClick={() => {
                        const base = pathname.startsWith("/manager")
                          ? "/manager/orders"
                          : "/admin/orders";
                        const type = status === "pending" ? "pending" : "tx";
                        router.push(`${base}/${row.id}?type=${type}`);
                      }}
                    >
                      <td className="py-3 pr-4 w-14">
                        {status === "pending"
                          ? formatDateOnly(row.createdAt)
                          : (processed.currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            {String(
                              userNameMap[row.userId || ""] ||
                                row.userName ||
                                row.email ||
                                row.userId ||
                                "?"
                            )
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                          <div className="text-gray-800">
                            {userNameMap[row.userId || ""] ||
                              row.userName ||
                              row.email ||
                              "—"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{row.packageDisplay || "—"}</td>
                      <td className="py-3 pr-4">{row.country || "—"}</td>
                      {status !== "pending" && (
                        <td className="py-3 pr-4">
                          {formatDateOnly(row.createdAt)}
                        </td>
                      )}
                      {status !== "pending" && (
                        <td className="py-3 pr-4">
                          <StatusBadge
                            status={(row as any).status || undefined}
                          />
                        </td>
                      )}
                      {status === "pending" && (
                        <td className="py-3 pl-4 pr-0 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const base = pathname.startsWith("/manager")
                                  ? "/manager/orders"
                                  : "/admin/orders";
                                router.push(`${base}/${row.id}?type=pending`);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white shadow hover:bg-emerald-700 active:scale-[.99]"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      )}
                      {status !== "pending" && (
                        <td className="py-3 pl-4 pr-0 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const base = pathname.startsWith("/manager")
                                ? "/manager/orders"
                                : "/admin/orders";
                              router.push(`${base}/${row.id}?type=tx`);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white shadow hover:bg-emerald-700 active:scale-[.99]"
                          >
                            View Details
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Pagination */}
      {!loading && !error && processed.total > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Page {processed.currentPage} of {processed.totalPages} •{" "}
            {processed.total} total
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={processed.currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={processed.currentPage >= processed.totalPages}
              onClick={() =>
                setPage((p) => Math.min(processed.totalPages, p + 1))
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* Hide cards when viewing an orders list (status present) */}
      {!(
        status === "all" ||
        status === "pending" ||
        status === "completed"
      ) && (
        <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c, i) => {
            const colors = colorMap[c.color];
            return (
              <div
                key={c.label}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${colors.ring} transition hover:shadow-md hover:-translate-y-0.5`}
                style={{ animation: `fadeIn 300ms ease ${i * 60}ms both` }}
              >
                <div className="p-5 flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${colors.bg} text-gray-700`}
                  >
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-500">{c.label}</div>
                    <div className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                      —
                    </div>
                  </div>
                  <span
                    className={`hidden sm:inline-flex px-2 py-1 rounded-lg text-xs font-medium ${colors.chipBg} ${colors.chipFg}`}
                  >
                    placeholder
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

export default function AdminDashboard() {
  return (
    <React.Suspense
      fallback={
        <section className="py-4">
          <div className="rounded-2xl bg-white shadow ring-1 ring-gray-100 p-4 text-sm text-gray-600">
            Loading dashboard…
          </div>
        </section>
      }
    >
      <AdminDashboardInner />
    </React.Suspense>
  );
}
