"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

const navItems = [
  // Sales Dashboard with children
  {
    label: "Sales Dashboard",
    href: "/manager/dashboard",
    color: "emerald",
    children: [
      {
        key: "all",
        label: "All Orders",
        href: "/manager/dashboard?status=all",
      },
      {
        key: "pending",
        label: "Pending Orders",
        href: "/manager/dashboard?status=pending",
      },
      {
        key: "completed",
        label: "Completed Orders",
        href: "/manager/dashboard?status=completed",
      },
    ],
  },
  { label: "User Management", href: "/manager/users", color: "sky" },
  {
    label: "Custom Packages",
    href: "/manager/usa-company-formation",
    color: "amber",
  },
  { label: "User Uploads", href: "/manager/user-uploads", color: "violet" },
  { label: "Coupon Codes", href: "/manager/coupons", color: "rose" },
  { label: "Amazon Courses", href: "/manager/amazon-courses", color: "violet" },
  { label: "Transactions", href: "/manager/transactions", color: "cyan" },
];

const iconBgClass: Record<string, string> = {
  emerald: "bg-emerald-50",
  sky: "bg-sky-50",
  violet: "bg-violet-50",
  amber: "bg-amber-50",
  rose: "bg-rose-50",
  cyan: "bg-cyan-50",
};
const iconFgClass: Record<string, string> = {
  emerald: "text-emerald-600",
  sky: "text-sky-600",
  violet: "text-violet-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
  cyan: "text-cyan-600",
};

export default function ManagerSidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string>("");
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setEmail(u?.email ?? null);
      // Try get displayName from Firestore Users doc
      try {
        if (u?.uid && db) {
          const { doc, getDoc } = await import("firebase/firestore");
          const snap = await getDoc(doc(db, "Users", u.uid));
          const data = (snap.exists() ? (snap.data() as any) : {}) as any;
          const dn = (
            data.displayName ||
            u.displayName ||
            u.email ||
            ""
          ).toString();
          setDisplayName(dn);
        } else {
          setDisplayName(u?.displayName || u?.email || "");
        }
      } catch {
        setDisplayName(u?.displayName || u?.email || "");
      }
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    // Auto-open Sales Dashboard if a child (status) is active
    const isDash = pathname.startsWith("/manager/dashboard");
    const hasStatus =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).has("status")
        : false;
    setOpenSections((prev) => ({
      ...prev,
      "/manager/dashboard": (isDash && hasStatus) || prev["/manager/dashboard"],
    }));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      if (auth) await firebaseSignOut(auth);
    } catch (e) {
      console.error(e);
    } finally {
      onNavigate?.();
      router.push("/login");
    }
  };

  return (
    <aside
      className={`z-40 w-[320px] fixed inset-y-0 left-0 transform transition-transform duration-200 ease-in-out md:transition-none ${
        open ? "translate-x-0" : "-translate-x-full"
      } overflow-y-auto md:translate-x-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto`}
    >
      <div className="h-full p-4">
        <div className="h-full flex flex-col bg-white/95 backdrop-blur rounded-2xl shadow ring-1 ring-gray-100">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="text-lg font-semibold tracking-tight text-emerald-700">
              Manager
            </div>
            <div className="mt-1 text-xs text-gray-500 truncate">
              {displayName || email || ""}
            </div>
          </div>
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const color = (item as any).color as string;
              const iconBg = iconBgClass[color] || "bg-gray-50";
              const iconFg = iconFgClass[color] || "text-gray-600";
              const hasChildren = Array.isArray((item as any).children);
              const isOpen = hasChildren ? !!openSections[item.href] : false;
              return (
                <div key={item.href}>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSections((s) => ({
                          ...s,
                          [item.href]: !s[item.href],
                        }))
                      }
                      className={`w-full group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-all ${
                        active || isOpen
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-lg ${iconBg} ${iconFg}`}
                        >
                          ●
                        </span>
                        <span className="tracking-tight">{item.label}</span>
                      </span>
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 9l6 6 6-6"
                        />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => onNavigate?.()}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-all ${
                        active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-lg ${iconBg} ${iconFg}`}
                      >
                        ●
                      </span>
                      <span className="tracking-tight">{item.label}</span>
                    </Link>
                  )}
                  {hasChildren && isOpen && (
                    <div className="mt-1 pl-11 space-y-1">
                      {(item as any).children.map(
                        (child: {
                          key: string;
                          label: string;
                          href: string;
                        }) => {
                          const childActive =
                            pathname.startsWith("/manager/dashboard") &&
                            (
                              searchParams.get("status") || "all"
                            ).toLowerCase() === child.key;
                          return (
                            <Link
                              key={child.key}
                              href={child.href}
                              onClick={() => onNavigate?.()}
                              className={`block px-2 py-1.5 rounded-lg text-sm font-medium transition ${
                                childActive
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="mt-auto p-4 border-top border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
