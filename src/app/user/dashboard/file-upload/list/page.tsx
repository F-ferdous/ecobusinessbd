"use client";

import React from "react";
import Link from "next/link";
import UserLayout from "@/components/user/UserLayout";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { ref as sRef, deleteObject } from "firebase/storage";

interface UploadItem {
  id: string;
  title?: string | null;
  packageName?: string | null;
  country?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  uploadTime?: Timestamp | null;
}

export default function UserUploadsListPage() {
  return (
    <UserLayout>
      <SectionContent />
    </UserLayout>
  );
}

function SectionContent() {
  const [email, setEmail] = React.useState<string | null>(null);
  const [uid, setUid] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [viewerOpen, setViewerOpen] = React.useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [currentName, setCurrentName] = React.useState<string>("Document");

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setEmail(u?.email ?? null);
      setUid(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  const loadUploads = React.useCallback(async () => {
    if (!db || !uid) return;
    try {
      setLoading(true);
      setError("");
      const col = collection(db, "UserUploads");
      const q1 = query(col, where("userId", "==", uid));
      const snap = await getDocs(q1);
      const list: UploadItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      list.sort((a: any, b: any) => {
        const at =
          a.uploadedAt?.toMillis?.() ??
          (a.uploadedAt
            ? a.uploadedAt.seconds * 1000
            : a.uploadTime?.toMillis?.() ??
              (a.uploadTime ? a.uploadTime.seconds * 1000 : 0));
        const bt =
          b.uploadedAt?.toMillis?.() ??
          (b.uploadedAt
            ? b.uploadedAt.seconds * 1000
            : b.uploadTime?.toMillis?.() ??
              (b.uploadTime ? b.uploadTime.seconds * 1000 : 0));
        return bt - at;
      });
      setItems(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load uploads");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  React.useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const formatDateTime = (ts?: Timestamp | null) => {
    if (!ts) return "—";
    const ms =
      (ts as any)?.toMillis?.() ??
      ((ts as any)?.seconds ? (ts as any).seconds * 1000 : null);
    return ms ? new Date(ms).toLocaleString() : "—";
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

  const handleView = (it: UploadItem) => {
    const url = (it as any).downloadURL || it.fileUrl;
    if (!url) return;
    setCurrentUrl(url);
    setCurrentName(it.title || getDocName(it));
    setViewerOpen(true);
  };

  const handleDelete = async (it: UploadItem) => {
    try {
      if (!db || !storage) throw new Error("Firebase not initialized");
      const ok = window.confirm("Are you sure you want to delete this upload?");
      if (!ok) return;

      if (it.filePath) {
        const r = sRef(storage, it.filePath);
        await deleteObject(r);
      } else if (it.fileUrl) {
        try {
          const r = sRef(storage, it.fileUrl);
          await deleteObject(r);
        } catch (_) {}
      }

      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "UserUploads", it.id));

      setItems((prev) => prev.filter((x) => x.id !== it.id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete upload");
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Uploads</h1>
            <p className="text-gray-600">List of your uploaded files.</p>
          </div>
          <Link
            href="/user/dashboard/file-upload"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-100"
          >
            Back to Upload
          </Link>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Sl
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Title
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-gray-600">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-gray-600">
                    No uploads yet.
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {it.title || getDocName(it)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateTime(it.uploadTime)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {it.fileUrl ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleView(it)}
                            className="px-2 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(it)}
                            className="px-2 py-1 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(it)}
                          className="px-2 py-1 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
                <div className="min-w-0">
                  <h3
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={currentName}
                  >
                    {currentName}
                  </h3>
                </div>
                <button
                  onClick={() => setViewerOpen(false)}
                  className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50">
                <iframe src={currentUrl} className="w-full h-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
