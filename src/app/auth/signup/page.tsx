"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";

const SignupForm = dynamic(() => import("@/components/auth/SignupForm").then(m => m.SignupForm), {
  ssr: false,
});

export default function SignupPage() {
  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          {/* Main Content */}
          <div className="mt-4">
            <SignupForm />
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <div className="space-y-2">
              <Link href="/" className="text-sm text-gray-600 hover:text-green-700">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}