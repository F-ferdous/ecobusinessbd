"use client";

import React from "react";
import AdminCouponsPage from "@/app/admin/coupons/page";

export default function ManagerCouponsPage() {
  return (
    <React.Suspense
      fallback={<div className="text-gray-600 p-4">Loading coupons…</div>}
    >
      <AdminCouponsPage />
    </React.Suspense>
  );
}
