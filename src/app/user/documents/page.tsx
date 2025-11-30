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

interface UploadItem {
  id: string;
  packageName?: string | null;
  country?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  uploadTime?: Timestamp | null;
}

export default function UserDocumentsPage() {
  return (
    <UserLayout>
      <SectionContent />
    </UserLayout>
  );
}

function SectionContent() {
  const [email, setEmail] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [currentName, setCurrentName] = React.useState<string>("Document");

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setEmail(u?.email ?? null));
    return () => unsub();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!db || !email) return;
      try {
        setLoading(true);
        setError("");
        const col = collection(db, "AdminUploads");
        let list: UploadItem[] = [];
        try {
          const q = query(
            col,
            where("userEmail", "==", (email || "").toLowerCase())
          );
          const snap = await getDocs(q);
          list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        } catch (e) {
          // fallback: no results
          list = [];
        }
        // sort by uploadTime desc in JS
        list.sort((a: any, b: any) => {
          const at =
            a.uploadTime?.toMillis?.() ??
            (a.uploadTime ? a.uploadTime.seconds * 1000 : 0);
          const bt =
            b.uploadTime?.toMillis?.() ??
            (b.uploadTime ? b.uploadTime.seconds * 1000 : 0);
          return bt - at;
        });
        if (!cancelled) setItems(list);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load documents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const formatDateDMY = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ?? (ts as any)?.seconds
        ? (ts as any).seconds * 1000
        : null;
    if (!ms) return "—";
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getDocName = (it: UploadItem): string => {
    if (it.filePath) return it.filePath.split("/").pop() || "Document";
    if (it.fileUrl) {
      try {
        const u = new URL(it.fileUrl);
        const path = decodeURIComponent(u.pathname);
        return path.split("/").pop() || "Document";
      } catch {
        return decodeURIComponent(
          it.fileUrl.split("?")[0].split("/").pop() || "Document"
        );
      }
    }
    return "Document";
  };

  const openViewer = (it: UploadItem) => {
    const name = getDocName(it);
    if (!it.fileUrl) return;
    setCurrentName(name);
    setCurrentUrl(it.fileUrl);
    setViewerOpen(true);
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600">
            Documents uploaded for your purchased packages.
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
                    Sl
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Package name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Document Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Upload Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.packageName || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.country || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {getDocName(it)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateDMY(it.uploadTime)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {it.fileUrl ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openViewer(it)}
                            className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          >
                            View
                          </button>
                          <a
                            href={it.fileUrl}
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
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No documents yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal viewer */}
        {viewerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4"
            onClick={() => setViewerOpen(false)}
          >
            <div
              className="mt-[10vh] bg-white rounded-2xl shadow-xl w-[80vw] max-w-[1200px] h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 p-3 border-b border-gray-200">
                <h3
                  className="text-sm font-semibold text-gray-900 truncate"
                  title={currentName}
                >
                  {currentName}
                </h3>
                <button
                  onClick={() => setViewerOpen(false)}
                  className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              <div className="flex-1">
                <iframe src={currentUrl} className="w-full h-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
