"use client";

import React from "react";
import UserLayout from "@/components/user/UserLayout";

export default function SupportPage() {
  return (
    <UserLayout>
      <section className="py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-sm text-gray-600">
            Get help and contact our support team.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
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
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.08 4.18 2 2 0 014.06 2h3a2 2 0 012 1.72 12.66 12.66 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.66 12.66 0 002.81.7A2 2 0 0122 16.92z"
                  />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-gray-900">
                Call Support
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              We’re available during business hours.
            </p>
            <SupportPhone />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
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
                    d="M4 4h16v16H4z"
                  />
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 6l-10 7L2 6"
                  />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-gray-900">
                Email Support
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Send us an email and we’ll get back to you.
            </p>
            <a
              href="mailto:helpdesk@ecobusinessbd.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Email helpdesk@ecobusinessbd.com
            </a>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

function SupportPhone() {
  const phone = "+1(307)372-1422";
  const tel = `tel:${phone.replace(/\s+/g, "")}`;
  return (
    <a
      href={tel}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-100"
    >
      {phone}
    </a>
  );
}
