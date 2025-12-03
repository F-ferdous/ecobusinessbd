"use client";

import React from "react";
import AdminDashboard from "@/app/admin/dashboard/page";

function ManagerDashboardContent() {
  return <AdminDashboard />;
}

export default function ManagerDashboardPage() {
  return (
    <React.Suspense
      fallback={<div className="text-gray-600 p-4">Loading dashboard…</div>}
    >
      <ManagerDashboardContent />
    </React.Suspense>
  );
}
