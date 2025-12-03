"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";

type AddOn = {
  id: string;
  title: string;
  price: number; // USD
  description: string;
  bullets?: string[];
};

// Unified Additional Services (from /services/additional-services)
const ADDITIONAL_SERVICES: AddOn[] = [
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
      "Trademark filing assistance. Government Class Fee $250 applies.",
  },
  {
    id: "uk-trademark",
    title: "UK Trademark Registration",
    price: 300,
    description:
      "Trademark filing assistance. Government Class Fee $240 applies.",
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
];

export default function USBasicPurchaseClient() {
  const params = useSearchParams();
  const pkgKey = (params.get("package") || "basic").toLowerCase();
  const PACKAGE_META: Record<
    string,
    {
      title: string;
      planPrice: number;
      stateFee: number;
      heading: string;
      note?: string;
    }
  > = {
    basic: {
      title: "Basic Package",
      planPrice: 149,
      stateFee: 199,
      heading: "USA LLC Formation – Basic",
      note: "One-time",
    },
    standard: {
      title: "Standard Package",
      planPrice: 349,
      stateFee: 449,
      heading: "USA LLC Formation – Standard",
      note: "One-time",
    },
    premium: {
      title: "Premium Package",
      planPrice: 449,
      stateFee: 579,
      heading: "USA LLC Formation – Premium",
      note: "One-time",
    },
    "amazon-plus": {
      title: "Amazon Plus",
      planPrice: 449,
      stateFee: 749,
      heading: "USA LLC Formation – Amazon Plus",
      note: "One-time",
    },
  };
  const meta = PACKAGE_META[pkgKey] || PACKAGE_META["basic"];

  const PACKAGE_FEATURES: Record<string, string[]> = {
    basic: [
      "Article of organization",
      "Certificate Of Formation",
      "Registered Agent for One Year",
      "Business Address for One Year",
      "Mail Forwarding for One Year",
      "Employer Identification Number (EIN)",
      "Basic Tax Consultation",
      "Operating Agreement",
      "Business Consultation",
    ],
    standard: [
      "Article of organization",
      "Certificate Of Formation",
      "Registered Agent for One Year",
      "Business Address for One year",
      "Mail Forwarding for One Year",
      "Employer Identification Number (EIN)",
      "Bank Account Application(Mercury/Relayfi/Airwallex)",
      "Business Bank Account (Fintech)",
      "Business Debit Card",
      "Basic Tax Consultation",
      "Professional Support for Managing Your Financial Accounts",
      "Hassle-Free Stripe Account Setup & Management with Expert Help",
      "Operating Agreement",
      "Lifetime Compliance Alerts",
    ],
    premium: [
      "Article of organization",
      "Certificate Of Formation",
      "Registered Agent for One Year",
      "Business Address for One year",
      "Mail Forwarding for One Year",
      "Employer Identification Number (EIN)",
      "ITIN & W-7 assistance.(Passport certified copy required from the client)",
      "Bank Account Application(Mercury/Relayfi/Airwallex)",
      "Business Bank Account (Fintech)",
      "Business Debit Card",
      "Basic Tax Consultation",
      "Professional Support for Managing Your Financial Accounts.",
      "Stripe Account Setup & Management with Expert Help",
      "Business PayPal Account with Expert Hand.",
      "BOI filling",
      "Operating Agreement",
      "Lifetime Compliance Alerts",
    ],
    "amazon-plus": [
      "Article of organization",
      "Certificate Of Formation",
      "Registered Agent for One Year",
      "Unique Business Address for One year",
      "Mail Forwarding for One Year",
      "Employer Identification Number (EIN)",
      "Bank Account Application(Mercury/Relayfi/Airwallex)",
      "Business Bank Account (Fintech)",
      "Business Debit Card",
      "Get Your Seller’s Permit with Expert Guidance.",
      "Reseller certificate.",
      "Amazon account application and approval.",
      "Basic Tax Consultation",
      "Professional Support for Managing Your Financial Accounts",
      "Operating Agreement",
      "Lifetime Compliance Alerts",
    ],
  };
  // UI state
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [coupon, setCoupon] = React.useState("");
  const [couponPercent, setCouponPercent] = React.useState<number>(0);
  const [couponError, setCouponError] = React.useState<string>("");

  // Company details form state
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
  const COMPANY_TYPES = [
    "LLC",
    "S-Corporation",
    "C- Corporation",
    "Partnership",
  ];
  const SERVICE_TYPES = [
    "E-Commerce",
    "Health",
    "B2B Software",
    "B2C Software",
    "Digital Marketing",
    "SAAS",
    "Educational Support Services",
    "Marketing Programs and Services",
    "Digital Services",
    "Other",
  ];

  const [state, setState] = React.useState(US_STATES[0]);
  const [companyType, setCompanyType] = React.useState(COMPANY_TYPES[0]);
  const [proposedName, setProposedName] = React.useState("");
  const [serviceType, setServiceType] = React.useState(SERVICE_TYPES[0]);
  const [memberType, setMemberType] = React.useState<"single" | "multiple">(
    "single"
  );
  const [formError, setFormError] = React.useState("");

  // Direct Firebase Auth state (replacing removed AuthContext)
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
  const [authMode, setAuthMode] = React.useState<"new" | "existing">("new");
  // Existing user login form state
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [loginSubmitting, setLoginSubmitting] = React.useState(false);
  // New user registration form state
  const [fullName, setFullName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regError, setRegError] = React.useState("");
  const [regSubmitting, setRegSubmitting] = React.useState(false);
  // Checkout state
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState("");

  const planPrice = meta.planPrice;
  const stateFee = STATE_FEES[state] || 0;
  const monthlyFee = 0;

  const addOnTotal = Object.entries(selected).reduce((sum, [id, on]) => {
    if (!on) return sum;
    const item = ADDITIONAL_SERVICES.find((x) => x.id === id);
    return sum + (item?.price || 0);
  }, 0);

  // Extra government fees for trademark registrations
  const extraFee =
    (selected["us-trademark"] ? 250 : 0) + (selected["uk-trademark"] ? 240 : 0);
  const subtotal = planPrice + stateFee + monthlyFee + addOnTotal + extraFee;
  const discount = Math.max(
    0,
    Math.round((subtotal * (couponPercent || 0)) / 100)
  );
  const total = Math.max(0, subtotal - discount);

  const toggleAddOn = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyCoupon = async () => {
    try {
      setCouponError("");
      const code = coupon.trim().toUpperCase();
      if (!code) {
        setCouponPercent(0);
        return;
      }
      if (!db) return;
      const snap = await getDocs(
        query(collection(db, "CouponCodes"), where("code", "==", code))
      );
      if (snap.empty) {
        setCouponPercent(0);
        setCouponError("Invalid coupon code");
        return;
      }
      const data = (snap.docs[0].data() as any) || {};
      const p = Number(data.percent || 0);
      if (!isFinite(p) || p <= 0) {
        setCouponPercent(0);
        setCouponError("Invalid coupon percentage");
        return;
      }
      setCouponPercent(p);
    } catch (_) {
      setCouponPercent(0);
      setCouponError("Failed to apply coupon");
    }
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password");
      return;
    }
    try {
      setLoginSubmitting(true);
      if (!auth) throw new Error("Firebase not initialized");
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error: unknown) {
      let msg = "Login failed";
      if (typeof error === "object" && error && "code" in error) {
        const code = (error as { code?: string; message?: string }).code;
        switch (code) {
          case "auth/user-not-found":
            msg = "No account found with this email";
            break;
          case "auth/wrong-password":
            msg = "Incorrect password";
            break;
          case "auth/invalid-email":
            msg = "Invalid email address";
            break;
          case "auth/user-disabled":
            msg = "This account has been disabled";
            break;
          default:
            msg = (error as { message?: string }).message || msg;
        }
      }
      setLoginError(msg);
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!fullName.trim()) {
      setRegError("Full Name is required");
      return;
    }
    if (!regEmail || !/\S+@\S+\.\S+/.test(regEmail)) {
      setRegError("Valid email is required");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }
    try {
      setRegSubmitting(true);
      if (!auth || !db) throw new Error("Firebase not initialized");
      const cred = await createUserWithEmailAndPassword(
        auth,
        regEmail,
        regPassword
      );
      const now = Timestamp.now();
      const payload = {
        id: cred.user.uid,
        email: cred.user.email || regEmail,
        displayName: fullName,
        country: null,
        mobileNumber: null,
        password: regPassword,
        Role: "User",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      } as const;
      await setDoc(doc(db, "Users", cred.user.uid), payload, { merge: true });
      // Stay signed in and let UI react via user context
    } catch (error: unknown) {
      let msg = "Registration failed";
      if (typeof error === "object" && error && "code" in error) {
        const code = (error as { code?: string; message?: string }).code;
        switch (code) {
          case "auth/email-already-in-use":
            msg = "An account already exists with this email";
            break;
          case "auth/invalid-email":
            msg = "Invalid email address";
            break;
          case "auth/weak-password":
            msg = "Password is too weak";
            break;
          default:
            msg = (error as { message?: string }).message || msg;
        }
      }
      setRegError(msg);
    } finally {
      setRegSubmitting(false);
    }
  };

  // Mount gate to ensure markup only renders on client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="bg-gray-50" style={{ minHeight: "40vh" }} />;
  }

  const handleProceedToCheckout = async () => {
    if (!user) return;
    // Validate required fields
    if (
      !state ||
      !companyType ||
      !serviceType ||
      !memberType ||
      !proposedName.trim()
    ) {
      setFormError(
        "Please complete all company details before proceeding to checkout."
      );
      return;
    }
    try {
      setCheckoutError("");
      setFormError("");
      // Persist rich order details locally for post-payment save
      try {
        const selectedAddOns = Object.entries(selected)
          .filter(([, on]) => !!on)
          .map(([id]) => {
            const item = ADDITIONAL_SERVICES.find((x) => x.id === id);
            return item
              ? { id: item.id, title: item.title, price: item.price }
              : { id, title: id, price: 0 };
          });
        const orderDetails = {
          userId: (user as any).uid || (user as any).id || null,
          email: (user as any).email || null,
          country: "USA",
          packageKey: pkgKey,
          packageTitle: meta.title,
          amount: total,
          currency: "USD",
          company: {
            state,
            companyType,
            proposedName: proposedName.trim(),
            serviceType,
            memberType,
          },
          addOns: selectedAddOns,
          features: PACKAGE_FEATURES[pkgKey] || PACKAGE_FEATURES["basic"],
          breakdown: {
            planPrice,
            stateFee,
            monthlyFee,
            addOnTotal,
            extraFee,
            discount,
            total,
          },
          couponCode: coupon.trim().toUpperCase() || null,
          couponPercent: couponPercent || 0,
          discountAmount: discount || 0,
          savedAt: Date.now(),
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "lastOrderDetails",
            JSON.stringify(orderDetails)
          );
        }
      } catch (_) {
        /* non-blocking */
      }
      setCheckoutLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageKey: pkgKey,
          packageTitle: meta.title,
          totalAmount: total,
          currency: "USD",
          userId: (user as any).id || (user as any).uid || null,
          customerEmail: (user as any).email || null,
          successPath: "/purchase/success",
          cancelPath: `/purchase/us/purchase?package=${encodeURIComponent(
            pkgKey
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
            {meta.heading}
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            Review your package, select extra services, apply coupon, and
            checkout.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: package + add-ons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package summary */}
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-800">
                    {meta.title}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Includes company formation, registered office address, and
                    company documents.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    ${planPrice}
                  </div>
                  <div className="text-xs text-gray-500">
                    {meta.note || "One-time"}
                  </div>
                </div>
              </div>
            </section>

            {/* Company details form (before additional services) */}
            <section className="bg-emerald-50 rounded-2xl shadow ring-1 ring-emerald-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4">
                Company Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Type
                  </label>
                  <select
                    required
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {COMPANY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Company Name
                  </label>
                  <input
                    required
                    value={proposedName}
                    onChange={(e) => setProposedName(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter proposed company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
                    required
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setMemberType("single")}
                      className={`px-4 py-3 text-base rounded-xl border ${
                        memberType === "single"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : "border-gray-200 text-gray-700"
                      }`}
                    >
                      Single Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberType("multiple")}
                      className={`px-4 py-3 text-base rounded-xl border ${
                        memberType === "multiple"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : "border-gray-200 text-gray-700"
                      }`}
                    >
                      Multiple Member
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Services (unified) */}
            <section>
              <h3 className="text-lg font-semibold text-emerald-700 mb-3">
                Additional Services
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {ADDITIONAL_SERVICES.map((item) => (
                  <label
                    key={item.id}
                    className="bg-white rounded-xl p-4 ring-1 ring-gray-100 shadow-sm hover:shadow transition cursor-pointer flex gap-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1.5 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                      checked={!!selected[item.id]}
                      onChange={() => toggleAddOn(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          ${item.price}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      {item.bullets && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc pl-5">
                          {item.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right: coupon + summary + auth */}
          <div className="space-y-6">
            {/* Package Features (from selected package) */}
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4">
                Package Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {(PACKAGE_FEATURES[pkgKey] || PACKAGE_FEATURES["basic"]).map(
                  (f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{f}</span>
                    </li>
                  )
                )}
              </ul>
            </section>
            {/* Coupon */}
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apply Coupon
              </label>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter coupon code"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-5 py-3 text-base rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="mt-2 text-sm text-rose-600">{couponError}</p>
              )}
              {couponPercent > 0 && !couponError && (
                <p className="mt-2 text-sm text-emerald-700">
                  {couponPercent}% discount applied
                </p>
              )}
            </section>

            {/* Summary */}
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Plan Price</span>
                  <span>${planPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>State Filing Fee</span>
                  <span>${stateFee.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly/Yearly Fee</span>
                  <span>${monthlyFee.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Services</span>
                  <span>${addOnTotal.toFixed(0)}</span>
                </div>
                {extraFee > 0 && (
                  <div className="flex justify-between">
                    <span>Trademark Government Fees</span>
                    <span>${extraFee.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Discount ({couponPercent}%)</span>
                  <span>- ${discount.toFixed(0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(0)}</span>
                </div>
              </div>
            </section>

            {/* Auth / Checkout section */}
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              {authLoading ? (
                <div className="py-2 text-sm text-gray-600">
                  Checking authentication...
                </div>
              ) : user ? (
                <div className="mt-2 space-y-4">
                  <div className="text-sm text-gray-700">
                    Logged in as{" "}
                    <span className="font-semibold">
                      {user.email || user.displayName || "User"}
                    </span>
                  </div>
                  {formError && (
                    <div className="text-sm text-red-600">{formError}</div>
                  )}
                  {checkoutError && (
                    <div className="text-sm text-red-600">{checkoutError}</div>
                  )}
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={
                      checkoutLoading ||
                      !proposedName.trim() ||
                      !state ||
                      !companyType ||
                      !serviceType ||
                      !memberType
                    }
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-base"
                  >
                    {checkoutLoading
                      ? "Redirecting to Stripe..."
                      : "Proceed to Checkout"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">
                      {authMode === "existing" ? "Existing User" : "New User"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {authMode === "existing" ? (
                        <button
                          onClick={() => setAuthMode("new")}
                          className="text-emerald-700 font-medium hover:underline"
                        >
                          New User?
                        </button>
                      ) : (
                        <button
                          onClick={() => setAuthMode("existing")}
                          className="text-emerald-700 font-medium hover:underline"
                        >
                          Existing User?
                        </button>
                      )}
                    </div>
                  </div>

                  {authMode === "existing" && (
                    <form
                      onSubmit={handleInlineLogin}
                      className="mt-4 space-y-4"
                    >
                      {loginError && (
                        <div className="text-sm text-red-600">{loginError}</div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loginSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-base"
                      >
                        {loginSubmitting ? "Logging in..." : "Log In"}
                      </button>
                    </form>
                  )}

                  {authMode === "new" && (
                    <form onSubmit={handleRegister} className="mt-4 space-y-4">
                      {regError && (
                        <div className="text-sm text-red-600">{regError}</div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={regSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-base"
                      >
                        {regSubmitting
                          ? "Creating account..."
                          : "Create Account"}
                      </button>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
