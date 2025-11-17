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

type UsaPackage = {
  id?: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  stateFee: number;
  features: string[];
  display: boolean;
};

export default function AdminUSACompanyFormationPage() {
  const [name, setName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [displayOnWebsite, setDisplayOnWebsite] = useState(true);
  const [stateFee, setStateFee] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [packages, setPackages] = useState<UsaPackage[]>([]);
  const [viewPkg, setViewPkg] = useState<UsaPackage | null>(null);

  // realtime list
  useEffect(() => {
    const q = query(collection(db, "Usa Packages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: UsaPackage[] = snap.docs.map((d) => {
        const data = d.data() as Partial<UsaPackage>;
        return {
          id: d.id,
          name: String(data.name ?? ""),
          originalPrice: Number(data.originalPrice ?? 0),
          discountedPrice: Number(data.discountedPrice ?? 0),
          stateFee: Number(data.stateFee ?? 0),
          features: Array.isArray(data.features) ? (data.features as string[]) : [],
          display: Boolean(data.display),
        };
      });
      setPackages(list);
    });
    return () => unsub();
  }, []);

  // computed stats
  const stats = useMemo(() => {
    const total = packages.length;
    const listed = packages.filter((p) => !!p.display).length;
    const pending = packages.filter((p) => !p.display).length;
    return { total, listed, pending };
  }, [packages]);

  const resetForm = () => {
    setName("");
    setOriginalPrice("");
    setDiscountedPrice("");
    setFeaturesInput("");
    setDisplayOnWebsite(true);
    setStateFee("");
  };

  const handleDelete = async (p: UsaPackage) => {
    if (!p.id) return;
    const ok = typeof window !== 'undefined' ? window.confirm(`Delete service "${p.name}"?`) : true;
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "Usa Packages", p.id));
    } catch (e) {
      console.error('Delete failed', e);
      setError("Failed to delete service");
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
    const orig = Number(originalPrice);
    const disc = Number(discountedPrice);
    const fee = Number(stateFee);
    if (Number.isNaN(orig) || Number.isNaN(disc) || Number.isNaN(fee)) {
      setError("Prices and State fee must be valid numbers");
      return;
    }
    const features = featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    try {
      setIsSaving(true);
      await addDoc(collection(db, "Usa Packages"), {
        name: name.trim(),
        originalPrice: orig,
        discountedPrice: disc,
        features,
        display: displayOnWebsite,
        stateFee: fee,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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
          <h1 className="text-2xl font-bold text-gray-900">USA Company Formation</h1>
          <p className="text-gray-600">Add and manage USA packages.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Packages", value: stats.total, color: "emerald" },
            { label: "Listed on Website", value: stats.listed, color: "sky" },
            { label: "Pending Completion", value: stats.pending, color: "amber" },
          ].map((c, i) => (
            <div
              key={c.label}
              className={`rounded-2xl bg-white ring-1 ring-gray-100 shadow p-5 transition hover:shadow-md hover:-translate-y-0.5`}
              style={{ animation: `fadeIn 300ms ease ${i * 80}ms both` }}
            >
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className="mt-1 text-3xl font-bold text-gray-900">{c.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            {showAddForm ? "Close" : "Add Service"}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div
            className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 mb-6 transition animate-[fadeIn_200ms_ease_both]"
          >
            {message && (
              <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">{message}</div>
            )}
            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Enter package name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 397" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
                <input type="number" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 197" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State Fee</label>
                <input type="number" value={stateFee} onChange={(e) => setStateFee(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <textarea value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} rows={6} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder={"Feature 1\nFeature 2\nFeature 3"} />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input id="display" type="checkbox" checked={displayOnWebsite} onChange={(e) => setDisplayOnWebsite(e.target.checked)} className="h-5 w-5 text-emerald-600 border-gray-300 rounded" />
                <label htmlFor="display" className="text-sm font-medium text-gray-700">Display on website</label>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of packages */}
        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 transition hover:shadow-md">
          <h3 className="text-base font-semibold text-gray-900 mb-4">All Services</h3>
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
                    <div className="text-xs text-gray-500">${p.discountedPrice} • State fee: ${p.stateFee} • {p.display ? 'Listed' : 'Hidden'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewPkg(p)} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">View</button>
                    <button onClick={() => handleDelete(p)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Delete</button>
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
                <h4 className="text-lg font-semibold text-gray-900">Edit Service</h4>
                <button onClick={() => setViewPkg(null)} className="text-gray-600 hover:text-gray-900">✕</button>
              </div>
              <EditForm pkg={viewPkg} onClose={() => setViewPkg(null)} />
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
}

function EditForm({ pkg, onClose }: { pkg: UsaPackage; onClose: () => void }) {
  const [name, setName] = useState(pkg.name);
  const [originalPrice, setOriginalPrice] = useState(String(pkg.originalPrice));
  const [discountedPrice, setDiscountedPrice] = useState(String(pkg.discountedPrice));
  const [stateFee, setStateFee] = useState(String(pkg.stateFee));
  const [featuresInput, setFeaturesInput] = useState((pkg.features || []).join("\n"));
  const [display, setDisplay] = useState(!!pkg.display);
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
      originalPrice: Number(originalPrice),
      discountedPrice: Number(discountedPrice),
      stateFee: Number(stateFee),
      features: featuresInput
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0),
      display,
      updatedAt: serverTimestamp(),
    };
    if (!payload.name || [payload.originalPrice, payload.discountedPrice, payload.stateFee].some((n) => Number.isNaN(n))) {
      setErr("Please provide valid values");
      return;
    }
    try {
      setSaving(true);
      await updateDoc(doc(db, "Usa Packages", pkg.id), payload as Record<string, unknown>);
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
      {ok && <div className="md:col-span-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">{ok}</div>}
      {err && <div className="md:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{err}</div>}

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
        <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
        <input type="number" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State Fee</label>
        <input type="number" value={stateFee} onChange={(e) => setStateFee(e.target.value)} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
        <textarea value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} rows={6} className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <input id="display-edit" type="checkbox" checked={display} onChange={(e) => setDisplay(e.target.checked)} className="h-5 w-5 text-emerald-600 border-gray-300 rounded" />
        <label htmlFor="display-edit" className="text-sm font-medium text-gray-700">Display on website</label>
      </div>
      <div className="md:col-span-2 flex items-center gap-2">
        <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        <button type="button" onClick={onClose} className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200">Cancel</button>
      </div>
    </form>
  );
}
