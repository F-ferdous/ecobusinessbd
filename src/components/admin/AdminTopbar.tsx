"use client";

import React from "react";
import Image from "next/image";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [email, setEmail] = React.useState<string | null>(null);
  const [role] = React.useState<string>("admin");
  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setEmail(u?.email ?? null));
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try { if (auth) await firebaseSignOut(auth); } catch (e) { console.error(e); }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-200 hover:bg-gray-50"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Image src="/assets/images/logo-green.png" alt="Eco Business" width={140} height={36} className="h-8 w-auto" />
            <span className="hidden sm:inline text-sm font-semibold text-gray-500">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-gray-900">{email || ''}</span>
            <span className="text-xs text-gray-500 capitalize">{role}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/></svg>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
