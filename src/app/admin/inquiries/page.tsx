"use client";

import React from "react";

export default function AdminInquiriesPage() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600">View customer inquiries and messages.</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 shadow animate-fadeInUp">
          <p className="text-sm text-gray-600">No inquiries yet. Coming soon.</p>
        </div>
      </div>
    </section>
  );
}
