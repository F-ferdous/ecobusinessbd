"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

// Reuse the additional services catalog used in purchase pages
const ADDITIONAL_SERVICES = [
  {
    id: "us-unique-address",
    title: "US Unique Business Address (One year)",
    price: 50,
    description: "One-year unique US business address with mail support.",
  },
  {
    id: "ein-application",
    title: "EIN Application",
    price: 50,
    description: "We apply for your EIN (Tax ID) and deliver confirmation.",
  },
  {
    id: "itin-w7",
    title: "ITIN & W-7 assistance",
    price: 100,
    description: "Guidance and assistance to obtain ITIN with W-7.",
  },
  {
    id: "seller-permit",
    title: "Seller Permit and Reseller certificate",
    price: 50,
    description: "Support to obtain seller’s permit and reseller certificate.",
  },
  {
    id: "boi-filing",
    title: "BOI filing",
    price: 30,
    description: "Beneficial Ownership Information filing assistance.",
  },
  {
    id: "amazon-business-approval",
    title: "Amazon Business account approval",
    price: 50,
    description: "Hands-on support for Amazon Business account approval.",
  },
  {
    id: "stripe-approval",
    title: "Stripe Account Approval",
    price: 40,
    description: "Guided setup and approval support for Stripe.",
  },
  {
    id: "paypal-approval",
    title: "Business PayPal Account Approval",
    price: 50,
    description: "Support to set up and approve Business PayPal account.",
  },
  {
    id: "us-trademark",
    title: "US Trademark Registration",
    price: 400,
    description:
      "Trademark filing assistance. Government Class Fee $250 applies (charged separately).",
  },
  {
    id: "uk-trademark",
    title: "UK Trademark Registration",
    price: 300,
    description:
      "Trademark filing assistance. Government Class Fee $240 applies (charged separately).",
  },
  {
    id: "confirmation-statement",
    title: "Confirmation Statement Filing",
    price: 100,
    description: "Annual confirmation statement filing service.",
  },
  {
    id: "vat-registration",
    title: "VAT Registration Number",
    price: 50,
    description: "Assistance in obtaining VAT Registration Number.",
  },
  {
    id: "uk-registered-office",
    title: "UK Registered Office address (One year)",
    price: 50,
    description: "Official UK registered office address for one year.",
  },
] as const;

type Service = (typeof ADDITIONAL_SERVICES)[number];

export default function AdditionalServicePurchaseClient() {
  const params = useSearchParams();
  const router = useRouter();
  const serviceId = (params.get("service") || "").toLowerCase();
  const service: Service | undefined =
    ADDITIONAL_SERVICES.find((s) => s.id === serviceId) ||
    ADDITIONAL_SERVICES[0];

  const [user, setUser] = React.useState<any | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  React.useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const [companyName, setCompanyName] = React.useState("");
  const [country, setCountry] = React.useState<"USA" | "UK">("USA");
  const [usState, setUsState] = React.useState("Delaware");
  const [formError, setFormError] = React.useState("");
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState("");

  // Country lock rules based on selected service
  const USA_SERVICES = React.useMemo(
    () =>
      new Set([
        "us-unique-address",
        "ein-application",
        "itin-w7",
        "seller-permit",
        "boi-filing",
        "us-trademark",
      ]),
    []
  );
  const UK_SERVICES = React.useMemo(
    () =>
      new Set(["uk-trademark", "confirmation-statement", "vat-registration"]),
    []
  );
  const forcedCountry: "USA" | "UK" | null = React.useMemo(() => {
    if (USA_SERVICES.has(service?.id || "")) return "USA";
    if (UK_SERVICES.has(service?.id || "")) return "UK";
    return null;
  }, [service?.id, USA_SERVICES, UK_SERVICES]);

  React.useEffect(() => {
    if (forcedCountry) setCountry(forcedCountry);
  }, [forcedCountry]);

  // Use the same state names as USA package page (names only; fees not used here)
  const STATE_FEES: Record<string, number> = {
    Alabama: 236,
    Alaska: 250,
    Arizona: 50,
    Arkansas: 45,
    California: 70,
    Colorado: 50,
    Connecticut: 120,
    Delaware: 110,
    "District of Columbia": 99,
    Florida: 125,
    Georgia: 100,
    Guam: 350,
    Hawaii: 51,
    Idaho: 100,
    Illinois: 150,
    Indiana: 100,
    Iowa: 50,
    Kansas: 160,
    Kentucky: 40,
    Louisiana: 105,
    Maine: 175,
    Maryland: 155,
    Massachusetts: 500,
    Michigan: 50,
    Minnesota: 155,
    Mississippi: 50,
    Missouri: 52,
    Montana: 35,
    Nebraska: 105,
    Nevada: 275,
    "New Hampshire": 100,
    "New Jersey": 125,
    "New Mexico": 50,
    "New York": 200,
    "North Carolina": 125,
    "North Dakota": 135,
    Ohio: 99,
    Oklahoma: 104,
    Oregon: 100,
    Pennsylvania: 125,
    "Puerto Rico": 250,
    "Rhode Island": 150,
    "South Carolina": 125,
    "South Dakota": 150,
    Tennessee: 300,
    Texas: 300,
    Utah: 54,
    Vermont: 125,
    Virginia: 100,
    Washington: 200,
    "West Virginia": 100,
    Wisconsin: 130,
    Wyoming: 100,
  };
  const US_STATES = Object.keys(STATE_FEES);

  const total = service?.price || 0;

  const handleCheckout = async () => {
    setCheckoutError("");
    if (!user) return;
    if (!companyName.trim()) {
      setFormError("Please enter company name");
      return;
    }
    try {
      setFormError("");
      // Save a snapshot to localStorage for dashboard rendering like other purchase pages
      const orderDetails = {
        userId: (user as any)?.uid || (user as any)?.id || null,
        email: (user as any)?.email || null,
        country,
        packageKey: service?.id || "additional",
        packageTitle: service?.title || "Additional Service",
        amount: total,
        currency: "USD",
        company: {
          state: country === "USA" ? usState : undefined,
          proposedName: companyName.trim(),
        },
        addOns: [],
        features: [service?.description || ""],
        breakdown: {
          planPrice: total,
          stateFee: 0,
          monthlyFee: 0,
          addOnTotal: 0,
          extraFee: 0,
          discount: 0,
          total,
        },
        savedAt: Date.now(),
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "lastOrderDetails",
          JSON.stringify(orderDetails)
        );
      }
      // If total is zero, bypass Stripe and record the transaction directly
      if (!(total > 0)) {
        try {
          setCheckoutLoading(true);
          if (!db) throw new Error("Firestore not initialized");
          // Read back order details for consistency
          let details: any = null;
          try {
            const raw =
              typeof window !== "undefined"
                ? window.localStorage.getItem("lastOrderDetails")
                : null;
            if (raw) details = JSON.parse(raw);
          } catch {}
          const effectiveUserId =
            details?.userId || (user as any)?.uid || (user as any)?.id || null;
          if (!effectiveUserId) throw new Error("Missing user");
          const createdAt = Timestamp.now();
          const rawKey = details?.savedAt
            ? `${effectiveUserId}_${details.savedAt}`
            : `${effectiveUserId}_${(
                details?.packageKey ||
                service?.id ||
                "additional"
              ).toString()}_${Math.round(Number(0) * 100)}_USD_${Date.now()}`;
          const txId = rawKey.replace(/[^a-zA-Z0-9_\-]/g, "_");
          const payload: any = {
            userId: effectiveUserId,
            email: details?.email || (user as any)?.email || null,
            packageKey: details?.packageKey || service?.id || "additional",
            packageTitle:
              details?.packageTitle || service?.title || "Additional Service",
            amount: 0,
            currency: "USD",
            status: "pending",
            createdAt,
            country: details?.country || country,
            company: details?.company || null,
            addOns: details?.addOns || [],
            features: details?.features || [],
            breakdown: details?.breakdown ?? null,
          };
          const txDocRef = doc(collection(db, "Transactions"), txId);
          const sanitized = Object.fromEntries(
            Object.entries(payload).filter(([, v]) => v !== undefined)
          );
          await setDoc(txDocRef, sanitized, { merge: true });
          // Clean local state and redirect
          try {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("lastOrderDetails");
              const base =
                (process.env.NEXT_PUBLIC_BASE_URL as string) ||
                (typeof window !== "undefined" ? window.location.origin : "");
              const target = `${base.replace(
                /\/$/,
                ""
              )}/user/dashboard/purchases`;
              window.location.assign(target);
              return;
            }
          } catch {}
        } catch (e: unknown) {
          setCheckoutError(e instanceof Error ? e.message : "Checkout failed");
        } finally {
          setCheckoutLoading(false);
        }
        return;
      }
      setCheckoutLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageKey: service?.id || "additional",
          packageTitle: service?.title || "Additional Service",
          totalAmount: total,
          currency: "USD",
          userId: (user as any).id || (user as any).uid || null,
          customerEmail: (user as any).email || null,
          successPath: "/purchase/success",
          cancelPath: `/purchase/additional?service=${encodeURIComponent(
            service?.id || "additional"
          )}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Unable to start checkout");
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid Stripe session URL");
      }
    } catch (e: unknown) {
      setCheckoutError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {service?.title}
          </h1>
          <p className="text-gray-600 mt-2 text-base">{service?.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: service details + form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-3">
                Service Details
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {service?.description}
              </p>
            </section>

            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4">
                Company Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Company Name
                  </label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 text-black placeholder-gray-400"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as any)}
                    disabled={!!forcedCountry}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 bg-white disabled:opacity-70 text-black"
                  >
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                  </select>
                  {forcedCountry && (
                    <p className="mt-1 text-xs text-gray-500">
                      Country is fixed to {forcedCountry} for this service.
                    </p>
                  )}
                </div>
                {country === "USA" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      value={usState}
                      onChange={(e) => setUsState(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 bg-white text-black"
                    >
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {formError && (
                <p className="mt-2 text-sm text-red-600">{formError}</p>
              )}
            </section>
          </div>

          {/* Right: summary and auth/checkout */}
          <div className="space-y-6">
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Service Price</span>
                  <span>${Number(total).toFixed(0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${Number(total).toFixed(0)}</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              {authLoading ? (
                <div className="py-2 text-sm text-gray-600">
                  Checking authentication...
                </div>
              ) : user ? (
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 disabled:opacity-60"
                >
                  {checkoutLoading
                    ? total > 0
                      ? "Redirecting to Stripe..."
                      : "Completing..."
                    : total > 0
                    ? "Proceed to Checkout"
                    : "Complete Purchase"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Please log in or sign up to continue.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="/login"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
                    >
                      Log In
                    </a>
                    <a
                      href="/auth/signup"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700"
                    >
                      Sign Up
                    </a>
                  </div>
                </div>
              )}
              {checkoutError && (
                <p className="mt-2 text-sm text-red-600">{checkoutError}</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
