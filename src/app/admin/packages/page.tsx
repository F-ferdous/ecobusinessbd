"use client";

import { useEffect, useMemo, useState } from "react";

interface PackageItem {
  id: string;
  name: string;
  description: string;
  type: "usa" | "uk";
  basePrice: number;
  currency: "USD" | "GBP";
  features: string[];
  processingTime?: string;
  createdAt?: Date;
}

export default function AdminPackagesPage() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"usa" | "uk" | "all">("all");

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "usa" as "usa" | "uk",
    basePrice: "",
    currency: "USD" as "USD" | "GBP",
    features: "",
    processingTime: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Seed mock data locally (no API/Firebase)
    const mock: PackageItem[] = [
      {
        id: "pkg_1",
        name: "USA LLC Formation",
        description: "Delaware / Wyoming / Florida",
        type: "usa",
        basePrice: 197,
        currency: "USD",
        features: ["Registered address", "Bank account consultation"],
        processingTime: "24-48h",
        createdAt: new Date(),
      },
      {
        id: "pkg_2",
        name: "UK Ltd Formation",
        description: "Companies House Registration",
        type: "uk",
        basePrice: 167,
        currency: "GBP",
        features: ["Registered office", "Documents"],
        processingTime: "24-48h",
        createdAt: new Date(),
      },
    ];
    setItems(mock);
    setLoading(false);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((p) => p.type === filter);
  }, [items, filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.description.trim() || !form.basePrice) {
      setError("Please fill name, description and price");
      return;
    }
    setSaving(true);
    try {
      const newItem: PackageItem = {
        id: `local_${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        basePrice: Number(form.basePrice),
        currency: form.currency,
        features: form.features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        processingTime: form.processingTime.trim() || undefined,
        createdAt: new Date(),
      };
      setItems((prev) => [newItem, ...prev]);
      setForm({ name: "", description: "", type: "usa", basePrice: "", currency: "USD", features: "", processingTime: "" });
    } catch (e: unknown) {
      console.error("Save failed", e);
      const message = e instanceof Error ? e.message : "Failed to save package";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Packages</h1>
            <p className="text-gray-600">Create and manage USA/UK service packages.</p>
          </div>

          {/* Create form */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Package</h2>
            {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "usa" | "uk" }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300 bg-white">
                  <option value="usa">USA</option>
                  <option value="uk">UK</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                <input type="number" value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value as "USD" | "GBP" }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300 bg-white">
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                <input value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
                <input value={form.processingTime} onChange={(e) => setForm((p) => ({ ...p, processingTime: e.target.value }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold disabled:opacity-60">
                  {saving ? "Saving..." : "Add Package"}
                </button>
              </div>
            </form>
          </div>

          {/* Filter and list */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-md text-sm ${filter === "all" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}>All</button>
              <button onClick={() => setFilter("usa")} className={`px-3 py-1 rounded-md text-sm ${filter === "usa" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}>USA</button>
              <button onClick={() => setFilter("uk")} className={`px-3 py-1 rounded-md text-sm ${filter === "uk" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}>UK</button>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-600">Loading packages...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow p-5">
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{p.type.toUpperCase()}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                  <div className="text-gray-600 text-sm mt-1">{p.description}</div>
                  <div className="mt-2 text-gray-900 font-semibold">
                    {p.currency} {Number(p.basePrice).toLocaleString()}
                  </div>
                  {p.processingTime && <div className="text-sm text-gray-500">Processing: {p.processingTime}</div>}
                  {p.features?.length ? (
                    <ul className="mt-2 text-sm list-disc list-inside text-gray-700">
                      {p.features.slice(0, 6).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}
