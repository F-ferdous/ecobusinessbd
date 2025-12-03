"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

type CustomPackage = {
  id?: string;
  name: string;
  price: number; // original/base price
  discountedPrice: number; // optional discounted price
  features: string[];
  status: "active" | "inactive";
  shareUrl?: string;
  createdAt?: any;
  updatedAt?: any;
};

export default function AdminUSACompanyFormationPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [packages, setPackages] = useState<CustomPackage[]>([]);
  const [viewPkg, setViewPkg] = useState<CustomPackage | null>(null);

  // realtime list
  useEffect(() => {
    const q = query(
      collection(db, "CustomPackage"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: CustomPackage[] = snap.docs.map((d) => {
        const data = d.data() as Partial<CustomPackage>;
        return {
          id: d.id,
          name: String(data.name ?? ""),
          price: Number(
            (data as any).price ?? (data as any).originalPrice ?? 0
          ),
          discountedPrice: Number(data.discountedPrice ?? 0),
          features: Array.isArray(data.features)
            ? (data.features as string[])
            : [],
          status: (data.status as any) === "inactive" ? "inactive" : "active",
          shareUrl: String((data as any).shareUrl || ""),
          createdAt: (data as any)?.createdAt,
          updatedAt: (data as any)?.updatedAt,
        };
      });
      setPackages(list);
    });
    return () => unsub();
  }, []);

  // computed stats
  const stats = useMemo(() => {
    const total = packages.length;
    const active = packages.filter((p) => p.status === "active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [packages]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDiscountedPrice("");
    setFeaturesInput("");
    setStatus("active");
  };

  const handleDelete = async (p: CustomPackage) => {
    if (!p.id) return;
    const ok =
      typeof window !== "undefined"
        ? window.confirm(`Delete package "${p.name}"?`)
        : true;
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "CustomPackage", p.id));
    } catch (e) {
      console.error("Delete failed", e);
      setError("Failed to delete package");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const orig = Number(price);
    const disc = Number(discountedPrice);
    if (Number.isNaN(orig) || Number.isNaN(disc)) {
      setError("Prices must be valid numbers");
      return;
    }
    const features = featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    try {
      setIsSaving(true);
      const ref = await addDoc(collection(db, "CustomPackage"), {
        name: name.trim(),
        price: orig,
        discountedPrice: disc,
        features,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Create shareable link and update doc
      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const link = `${origin}/purchase/custom/${ref.id}`;
        await updateDoc(ref, { shareUrl: link, updatedAt: serverTimestamp() });
      } catch {}
      setMessage("Package saved");
      resetForm();
      setShowAddForm(false);
    } catch (err: unknown) {
      setError("Failed to save package");
      // console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Custom Package</h1>
          <p className="text-gray-600">
            Create and manage custom packages with shareable purchase links.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Packages", value: stats.total, color: "emerald" },
            { label: "Active", value: stats.active, color: "sky" },
            { label: "Inactive", value: stats.inactive, color: "amber" },
          ].map((c, i) => (
            <div
              key={c.label}
              className={`rounded-2xl bg-white ring-1 ring-gray-100 shadow p-5 transition hover:shadow-md hover:-translate-y-0.5`}
              style={{ animation: `fadeIn 300ms ease ${i * 80}ms both` }}
            >
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Packages</h2>
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            {showAddForm ? "Close" : "Add Package"}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 mb-6 transition animate-[fadeIn_200ms_ease_both]">
            {message && (
              <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter package name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 397"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discounted Price
                </label>
                <input
                  type="number"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 197"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (one per line)
                </label>
                <textarea
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={"Feature 1\nFeature 2\nFeature 3"}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of packages */}
        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 transition hover:shadow-md">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            All Packages
          </h3>
          {packages.length === 0 ? (
            <div className="text-sm text-gray-600">No services found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {packages.map((p, i) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between transition hover:bg-gray-50 rounded-lg px-2"
                  style={{ animation: `fadeIn 300ms ease ${i * 40}ms both` }}
                >
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      ${p.discountedPrice || p.price} •{" "}
                      {p.status === "active" ? "Active" : "Inactive"}
                    </div>
                    {p.shareUrl && (
                      <div className="mt-1 inline-flex items-center gap-2 text-xs">
                        <a
                          href={p.shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 10-7.07-7.07L10 5m4 6a5 5 0 01-7.07 0L5.5 9.57a5 5 0 017.07-7.07L14 3"
                            />
                          </svg>
                          Open Link
                        </a>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(p.shareUrl!)
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-200"
                          type="button"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2zm3-4h7a2 2 0 012 2v7"
                            />
                          </svg>
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewPkg(p)}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View/Edit Modal */}
        {viewPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-[fadeIn_150ms_ease_both]">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 animate-[fadeIn_220ms_ease_both]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Edit Package
                </h4>
                <button
                  onClick={() => setViewPkg(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              <EditForm pkg={viewPkg} onClose={() => setViewPkg(null)} />
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
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

function EditForm({
  pkg,
  onClose,
}: {
  pkg: CustomPackage;
  onClose: () => void;
}) {
  const [name, setName] = useState(pkg.name);
  const [price, setPrice] = useState(String(pkg.price));
  const [discountedPrice, setDiscountedPrice] = useState(
    String(pkg.discountedPrice)
  );
  const [featuresInput, setFeaturesInput] = useState(
    (pkg.features || []).join("\n")
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    pkg.status || "active"
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!pkg.id) return;
    const payload = {
      name: name.trim(),
      price: Number(price),
      discountedPrice: Number(discountedPrice),
      features: featuresInput
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0),
      status,
      updatedAt: serverTimestamp(),
    };
    if (
      !payload.name ||
      [payload.price, payload.discountedPrice].some((n) => Number.isNaN(n))
    ) {
      setErr("Please provide valid values");
      return;
    }
    try {
      setSaving(true);
      await updateDoc(
        doc(db, "CustomPackage", pkg.id),
        payload as Record<string, unknown>
      );
      setOk("Updated");
      setTimeout(() => onClose(), 600);
    } catch (e) {
      setErr("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-4">
      {ok && (
        <div className="md:col-span-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          {ok}
        </div>
      )}
      {err && (
        <div className="md:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Discounted Price
        </label>
        <input
          type="number"
          value={discountedPrice}
          onChange={(e) => setDiscountedPrice(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Features (one per line)
        </label>
        <textarea
          value={featuresInput}
          onChange={(e) => setFeaturesInput(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {pkg.shareUrl && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shareable Link
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={pkg.shareUrl}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(pkg.shareUrl!)}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              Copy
            </button>
            <a
              href={pkg.shareUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
            >
              Open
            </a>
          </div>
        </div>
      )}
      <div className="md:col-span-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
