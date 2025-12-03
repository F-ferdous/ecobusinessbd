import React from "react";
import ManagerLayout from "@/components/manager/ManagerLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={<div className="text-gray-600 p-4">Loading…</div>}
    >
      <ManagerLayout>{children}</ManagerLayout>
    </React.Suspense>
  );
}
