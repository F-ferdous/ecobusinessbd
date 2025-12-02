"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  {
    label: "Dashboard",
    href: "/user/dashboard",
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
  },
  {
    label: "Purchases",
    href: "/user/dashboard/purchases",
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
          d="M3 7l9-4 9 4-9 4-9-4m0 6l9 4 9-4"
        />
      </svg>
    ),
  },
  {
    label: "Documents",
    href: "/user/documents",
    color: "indigo",
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
          d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm3 4h7m-7 4h7m-7 4h7"
        />
      </svg>
    ),
  },
  {
    label: "File Upload",
    href: "/user/dashboard/file-upload",
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
  {
    label: "Messages",
    href: "/user/dashboard/messages",
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
          d="M7 8h10M7 12h7M5 20l4-4h10a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14z"
        />
      </svg>
    ),
  },
  {
    label: "Support",
    href: "/user/dashboard/support",
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
          d="M18 13a3 3 0 00-3-3H9a3 3 0 00-3 3v4h12v-4zM9 10V7a3 3 0 016 0v3"
        />
      </svg>
    ),
  },
  {
    label: "Courses Enrolled",
    href: "/user/courses",
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
          d="M12 20l9-5-9-5-9 5 9 5z M12 10l9-5-9-5-9 5 9 5z"
        />
      </svg>
    ),
  },
];

export default function UserSidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  const rawPathname = usePathname();
  const pathname = React.useMemo(() => {
    if (!rawPathname) return "/";
    return rawPathname !== "/" ? rawPathname.replace(/\/+$/, "") : rawPathname;
  }, [rawPathname]);
  const [email, setEmail] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setEmail(u?.email ?? null);
      setDisplayName(u?.displayName ?? null);
    });
    return () => unsub();
  }, []);
  const router = useRouter();

  const iconBgClass: Record<string, string> = {
    emerald: "bg-emerald-50",
    sky: "bg-sky-50",
    indigo: "bg-indigo-50",
    violet: "bg-violet-50",
  };
  const iconFgClass: Record<string, string> = {
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    indigo: "text-indigo-600",
    violet: "text-violet-600",
  };

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
      className={`z-40 w-[320px]
      fixed inset-y-0 left-0 transform transition-transform duration-200 ease-in-out md:transition-none
      ${open ? "translate-x-0" : "-translate-x-full"}
      overflow-y-auto md:translate-x-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto`}
    >
      <div className="h-full p-4">
        <div className="h-full flex flex-col bg-white/95 backdrop-blur rounded-2xl shadow ring-1 ring-gray-100">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="text-lg font-semibold tracking-tight text-emerald-700 flex items-center gap-2">
              <span>User Panel</span>
              {displayName && (
                <span className="text-gray-600 text-sm font-medium truncate">
                  {displayName}
                </span>
              )}
            </div>
          </div>
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isDashboard = item.href === "/user/dashboard";
              const hrefNorm = item.href.replace(/\/+$/, "");
              const active = isDashboard
                ? pathname === hrefNorm
                : pathname === hrefNorm || pathname.startsWith(hrefNorm + "/");
              const color = item.color as string;
              const iconBg = iconBgClass[color] || "bg-gray-50";
              const iconFg = iconFgClass[color] || "text-gray-600";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-all
                  ${
                    active
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
                >
                  <span
                    className={`shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-lg ${iconBg} ${iconFg}`}
                  >
                    {item.icon}
                  </span>
                  <span className="tracking-tight">{item.label}</span>
                </Link>
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
          </div>
        </div>
      </div>
    </aside>
  );
}
