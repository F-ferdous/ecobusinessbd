"use client";

import React from "react";

const cards = [
  {
    label: "Registered Users",
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
          d="M16 14a4 4 0 10-8 0v2H5a3 3 0 00-3 3v1h20v-1a3 3 0 00-3-3h-3v-2zM12 12a4 4 0 100-8 4 4 0 000 8z"
        />
      </svg>
    ),
  },
  {
    label: "USA Packages Purchased",
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
          d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4"
        />
      </svg>
    ),
  },
  {
    label: "UK Packages Purchased",
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
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    label: "Courses Listed",
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
  {
    label: "User Queries",
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
          d="M8 10h8M8 14h5M21 12a9 9 0 11-6.219-8.56"
        />
      </svg>
    ),
  },
];

const colorMap: Record<
  string,
  { bg: string; ring: string; chipBg: string; chipFg: string }
> = {
  emerald: {
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    chipBg: "bg-emerald-100",
    chipFg: "text-emerald-700",
  },
  sky: {
    bg: "bg-sky-50",
    ring: "ring-sky-100",
    chipBg: "bg-sky-100",
    chipFg: "text-sky-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    ring: "ring-indigo-100",
    chipBg: "bg-indigo-100",
    chipFg: "text-indigo-700",
  },
  violet: {
    bg: "bg-violet-50",
    ring: "ring-violet-100",
    chipBg: "bg-violet-100",
    chipFg: "text-violet-700",
  },
  amber: {
    bg: "bg-amber-50",
    ring: "ring-amber-100",
    chipBg: "bg-amber-100",
    chipFg: "text-amber-700",
  },
};

export default function AdminDashboard() {
  return (
    <section className="py-4">
      <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => {
          const colors = colorMap[c.color];
          return (
            <div
              key={c.label}
              className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${colors.ring} transition hover:shadow-md hover:-translate-y-0.5`}
              style={{ animation: `fadeIn 300ms ease ${i * 60}ms both` }}
            >
              <div className="p-5 flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${colors.bg} text-gray-700`}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">{c.label}</div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                    —
                  </div>
                </div>
                <span
                  className={`hidden sm:inline-flex px-2 py-1 rounded-lg text-xs font-medium ${colors.chipBg} ${colors.chipFg}`}
                >
                  placeholder
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
