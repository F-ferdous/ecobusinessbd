"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";

export default function SupportPage() {
  return (
    <UserLayout>
      <section className="py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-sm text-gray-600">
            Get help and contact our support team.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          Coming soon.
        </div>
      </section>
    </UserLayout>
  );
}
