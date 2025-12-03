"use client";

import React from "react";
import CustomPackagePurchaseClient from "@/components/purchase/CustomPackagePurchaseClient";

export default function CustomPurchasePage() {
  return (
    <React.Suspense
      fallback={
        <section className="min-h-[50vh] flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 w-full max-w-md text-center">
            <div className="text-xl font-semibold text-gray-900">Loading…</div>
          </div>
        </section>
      }
    >
      <CustomPackagePurchaseClient />
    </React.Suspense>
  );
}
