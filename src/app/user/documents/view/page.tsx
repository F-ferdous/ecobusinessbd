"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

type UploadRow = {
  id: string;
  packageName?: string | null;
  country?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  uploadTime?: Timestamp | null;
  title?: string | null;
};

export default function DocumentsViewPage() {
  return (
    <UserLayout>
      <React.Suspense
        fallback={<div className="text-gray-600 p-4">Loading…</div>}
      >
        <Content />
      </React.Suspense>
    </UserLayout>
  );
}

function Content() {
  const params = useSearchParams();
  const [uid, setUid] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<UploadRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  const pkgTitle = params.get("package") || "Service Package";
  const country = params.get("country") || "";

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
        const col = collection(db, "AdminUploads");
        // Simple where on userId only; no composite indexes
        const q = query(col, where("userId", "==", uid));
        const snap = await getDocs(q);
        let list: UploadRow[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            packageName: data.packageName || null,
            country: data.country || null,
            fileUrl: data.downloadURL || data.fileUrl || null,
            filePath: data.storagePath || data.filePath || null,
            uploadTime: data.uploadedAt || data.uploadTime || null,
            title: data.title || null,
          } as UploadRow;
        });
        // If package filter present, filter client-side (exact, case-insensitive)
        if (pkgTitle.trim()) {
          const norm = (s: any) => (s ?? "").toString().toLowerCase();
          const pkgNorm = norm(pkgTitle);
          list = list.filter((r) => norm(r.packageName) === pkgNorm);
        }
        if (country.trim()) {
          const norm = (s: any) => (s ?? "").toString().toLowerCase();
          const c = norm(country);
          list = list.filter((r) => norm(r.country) === c);
        }
        // Sort by uploadTime desc
        list.sort((a: any, b: any) => {
          const at =
            a.uploadTime?.toMillis?.() ||
            (a.uploadTime ? a.uploadTime.seconds * 1000 : 0);
          const bt =
            b.uploadTime?.toMillis?.() ||
            (b.uploadTime ? b.uploadTime.seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setRows(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load documents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, pkgTitle, country]);

  const formatDateDMY = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ||
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    if (!ms) return "—";
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const fileName = (r: UploadRow) => {
    if (r.title) return r.title;
    if (r.filePath) return r.filePath.split("/").pop() || "Document";
    if (r.fileUrl) {
      try {
        const u = new URL(r.fileUrl);
        return decodeURIComponent(u.pathname.split("/").pop() || "Document");
      } catch {
        return decodeURIComponent(
          r.fileUrl.split("?")[0].split("/").pop() || "Document"
        );
      }
    }
    return "Document";
  };

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">
            Uploaded Documents
          </h1>
          <p className="text-sm text-gray-600">
            {pkgTitle}
            {country ? ` • ${country}` : ""}
          </p>
        </div>

        {loading && <div className="text-gray-600">Loading…</div>}
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl bg-white shadow ring-1 ring-gray-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="text-left px-4 py-3 font-semibold w-12">Sl</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Package name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Country</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Document Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Upload Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">
                        {r.packageName || pkgTitle || "Service Package"}
                      </td>
                      <td className="px-4 py-3">
                        {r.country || country || "—"}
                      </td>
                      <td className="px-4 py-3">{fileName(r)}</td>
                      <td className="px-4 py-3">
                        {formatDateDMY(r.uploadTime)}
                      </td>
                      <td className="px-4 py-3">
                        {r.fileUrl ? (
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            >
                              View
                            </a>
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="px-2 py-1 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No file</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
