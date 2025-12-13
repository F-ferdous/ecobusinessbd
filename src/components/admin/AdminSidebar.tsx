"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  // 1. Sales Dashboard
  {
    label: "Sales Dashboard",
    href: "/admin/dashboard",
    color: "emerald",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    children: [
      { key: "all", label: "All Orders", href: "/admin/dashboard?status=all" },
      {
        key: "pending",
        label: "Pending Orders",
        href: "/admin/dashboard?status=pending",
      },
      {
        key: "completed",
        label: "Completed Orders",
        href: "/admin/dashboard?status=completed",
      },
    ],
  },
  // 2. User Management
  {
    label: "User Management",
    href: "/admin/users",
    color: "sky",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0 0a4 4 0 100-8 4 4 0 000 8zm8-4a4 4 0 100-8 4 4 0 000 8z"
        />
      </svg>
    ),
  },
  // 3. Custom Packages (renamed from USA Company Formation)
  {
    label: "Custom Packages",
    href: "/admin/usa-company-formation",
    color: "amber",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 12H4"
        />
      </svg>
    ),
  },
  // 4. User Uploads
  {
    label: "User Uploads",
    href: "/admin/user-uploads",
    color: "violet",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4"
        />
      </svg>
    ),
  },
  // 5. Coupon Codes
  {
    label: "Coupon Codes",
    href: "/admin/coupons",
    color: "rose",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7h16a1 1 0 011 1v2a2 2 0 110 4v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a2 2 0 110-4V8a1 1 0 011-1z"
        />
      </svg>
    ),
  },
  // 6. Amazon Courses (renamed)
  {
    label: "Amazon Courses",
    href: "/admin/amazon-courses",
    color: "violet",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z"
        />
      </svg>
    ),
  },
  // 7. Transactions (renamed from Transaction Details)
  {
    label: "Transactions",
    href: "/admin/transactions",
    color: "cyan",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h10M5 7h14"
        />
      </svg>
    ),
  },
  // 8. Supports (tickets)
  {
    label: "Supports",
    href: "/admin/supports",
    color: "teal",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 13a3 3 0 00-3-3H9a3 3 0 00-3 3v4h12v-4zM9 10V7a3 3 0 016 0v3"
        />
      </svg>
    ),
  },
];

export default function AdminSidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({});
  React.useEffect(() => {
    // Auto-open Sales Dashboard only if a child is active (has status query)
    const isDashboard = pathname.startsWith("/admin/dashboard");
    const hasStatus =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).has("status")
        : false;
    setOpenSections((prev) => ({
      ...prev,
      "/admin/dashboard":
        (isDashboard && hasStatus) || prev["/admin/dashboard"],
    }));
  }, [pathname]);
  const [email, setEmail] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setEmail(u?.email ?? null));
    return () => unsub();
  }, []);
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

  const iconBgClass: Record<string, string> = {
    emerald: "bg-emerald-50",
    sky: "bg-sky-50",
    violet: "bg-violet-50",
    amber: "bg-amber-50",
    indigo: "bg-indigo-50",
    rose: "bg-rose-50",
    teal: "bg-teal-50",
    cyan: "bg-cyan-50",
  };
  const iconFgClass: Record<string, string> = {
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    violet: "text-violet-600",
    amber: "text-amber-600",
    indigo: "text-indigo-600",
    rose: "text-rose-600",
    teal: "text-teal-600",
    cyan: "text-cyan-600",
  };

  return (
    <aside
      className={`z-40 w-[320px]
      fixed inset-y-0 left-0 transform transition-transform duration-200 ease-in-out md:transition-none
      ${open ? "translate-x-0" : "-translate-x-full"}
      overflow-y-auto md:translate-x-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto`}
    >
      <div className="h-full p-4">
        <div className="h-full flex flex-col bg-white/95 backdrop-blur rounded-2xl shadow ring-1 ring-gray-100">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="text-lg font-semibold tracking-tight text-emerald-700">
              Admin Panel
            </div>
            <div className="mt-1 text-xs text-gray-500 truncate">
              {email || ""}
            </div>
          </div>
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const color = item.color as string;
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
                          {item.icon}
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
                        {item.icon}
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
                          // Determine active child by status param when on /admin/dashboard
                          let childActive = false;
                          if (
                            item.href === "/admin/dashboard" &&
                            pathname.startsWith("/admin/dashboard")
                          ) {
                            const status = (
                              searchParams.get("status") || "all"
                            ).toLowerCase();
                            childActive = status === child.key;
                          } else {
                            const currentQuery = searchParams.toString();
                            const current = `${pathname}${
                              currentQuery ? `?${currentQuery}` : ""
                            }`;
                            childActive = current === child.href;
                          }
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
          <div className="mt-auto p-4 border-t border-gray-100">
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
            <p className="text-xs text-gray-500 mt-2 text-center">
              {" "}
              &copy;{" "}
              <span suppressHydrationWarning>
                {new Date().getFullYear()}
              </span>{" "}
              Eco Business
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
