"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function SimpleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (!auth) throw new Error("Firebase not initialized");
      await signInWithEmailAndPassword(auth, email, password);
      const currentEmail = (auth.currentUser?.email || "").trim().toLowerCase();
      const uid = auth.currentUser?.uid;

      if (currentEmail === "admin@ecobusinessbd.com") {
        router.replace("/admin/dashboard");
        return;
      }

      if (db && uid) {
        try {
          const snap = await getDoc(doc(db, "Users", uid));
          const data = (snap.data() as any) || {};
          const role = ((data.role || data.Role || "") as string).toLowerCase();
          if (role === "admin") {
            router.replace("/admin/dashboard");
            return;
          }
          if (role === "manager") {
            router.replace("/manager/dashboard");
            return;
          }
          if (role === "user") {
            router.replace("/user/dashboard");
            return;
          }
        } catch {
          // ignore and fallback below
        }
      }

      router.replace("/user/dashboard");
    } catch (err: unknown) {
      // Map common Firebase errors to user-friendly messages
      let msg = "An error occurred during login";
      const code = (err as any)?.code as string | undefined;
      if (code === "auth/user-not-found")
        msg = "No account found with this email address";
      else if (code === "auth/wrong-password") msg = "Incorrect password";
      else if (code === "auth/invalid-email") msg = "Invalid email address";
      else if (code === "auth/user-disabled")
        msg = "This account has been disabled";
      else if ((err as any)?.message) msg = (err as any).message;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="mt-4">
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white shadow-lg rounded-lg p-10 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="mb-4 flex justify-center">
                    <Image
                      src="/assets/images/logo-black.png"
                      alt="Eco Business Logo"
                      width={160}
                      height={40}
                      className="h-12 w-auto"
                      priority
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-green-600">Sign In</h1>
                  <p className="text-gray-600 mt-2">
                    Access your EcoBusiness account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Get Started
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="space-y-2">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-green-700"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
