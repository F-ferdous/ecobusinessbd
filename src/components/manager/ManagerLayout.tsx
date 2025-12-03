"use client";

import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ManagerSidebar from "@/components/manager/ManagerSidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="md:hidden px-4 pt-3">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm active:scale-[.99]"
        >
          <svg
            className="h-5 w-5 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6h18M3 12h18M3 18h18"
            />
          </svg>
          Menu
        </button>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-1">
        <ManagerSidebar
          open={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />
        <div className="flex-1">
          <main className="p-4 sm:p-6 lg:p-8 h-auto bg-white/90">
            <div className="backdrop-blur rounded-2xl shadow ring-1 ring-gray-100 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
