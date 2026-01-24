"use client";

import React from "react";
import { useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function CustomPackagePurchaseClient() {
  const params = useParams();
  const id = (params as any)?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [pkg, setPkg] = React.useState<any | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        if (!db || !id) throw new Error("Invalid package link");
        const snap = await getDoc(doc(db, "CustomPackage", id));
        if (!snap.exists()) throw new Error("Package not found or inactive");
        const data = snap.data() || {};
        if ((data as any).status === "inactive")
          throw new Error("Package is inactive");
        if (!cancelled) setPkg({ id: snap.id, ...(data as any) });
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load package");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Use the same Additional Services set as other purchase pages
  const ADDITIONAL: {
    id: string;
    title: string;
    price: number;
    description: string;
  }[] = [
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
      description:
        "Support to obtain seller’s permit and reseller certificate.",
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

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [coupon, setCoupon] = React.useState("");
  const [couponPercent, setCouponPercent] = React.useState<number>(0);
  const [couponError, setCouponError] = React.useState<string>("");

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
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [loginSubmitting, setLoginSubmitting] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regError, setRegError] = React.useState("");
  const [regSubmitting, setRegSubmitting] = React.useState(false);

  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"stripe" | "paypal">(
    "stripe",
  );

  // Required form fields (similar to UK flow)
  // Country toggle and dependent options
  const [country, setCountry] = React.useState<"UK" | "USA">("UK");
  // USA state fees (mirrors USA flow)
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
  const UK_COMPANY_TYPES = ["LLP", "LTD"] as const;
  const USA_COMPANY_TYPES = [
    "LLC",
    "S-Corporation",
    "C- Corporation",
    "Partnership",
  ] as const;
  const COMPANY_TYPES = UK_COMPANY_TYPES;
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
  const [companyType, setCompanyType] = React.useState<string>(
    UK_COMPANY_TYPES[0],
  );
  const [serviceType, setServiceType] = React.useState<string>(
    SERVICE_TYPES[0],
  );
  const [memberType, setMemberType] = React.useState<"single" | "multiple">(
    "single",
  );
  const [proposedName, setProposedName] = React.useState("");
  const [usState, setUsState] = React.useState<string>(US_STATES[0]);

  // Sync defaults when switching country
  React.useEffect(() => {
    if (country === "UK") {
      setCompanyType(UK_COMPANY_TYPES[0]);
    } else {
      setCompanyType(USA_COMPANY_TYPES[0]);
      if (!US_STATES.includes(usState)) {
        setUsState(US_STATES[0]);
      }
    }
  }, [country]);

  const planPrice = React.useMemo(() => {
    if (!pkg) return 0;
    const disc = Number(pkg.discountedPrice || 0);
    return disc > 0 ? disc : Number(pkg.price || 0);
  }, [pkg]);
  const monthlyFee = 0;
  const stateFee = country === "USA" ? STATE_FEES[usState] || 0 : 0;

  const addOnTotal = Object.entries(selected).reduce((sum, [id, on]) => {
    if (!on) return sum;
    const item = ADDITIONAL.find((x) => x.id === id);
    return sum + (item?.price || 0);
  }, 0);

  // Extra government fees for trademark registrations
  const extraFee =
    (selected["us-trademark"] ? 250 : 0) + (selected["uk-trademark"] ? 240 : 0);
  const subtotal = planPrice + stateFee + monthlyFee + addOnTotal + extraFee;
  const discount = Math.max(
    0,
    Math.round((subtotal * (couponPercent || 0)) / 100),
  );
  const total = Math.max(0, subtotal - discount);

  const toggleAddOn = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

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
        query(collection(db, "CouponCodes"), where("code", "==", code)),
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
    } catch (error: any) {
      setLoginError(error?.message || "Login failed");
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
        regPassword,
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
    } catch (error: any) {
      setRegError(error?.message || "Registration failed");
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!user || !pkg) return;
    try {
      setCheckoutError("");
      setFormError("");
      if (
        !proposedName.trim() ||
        !companyType ||
        !serviceType ||
        !memberType ||
        (country === "USA" && !usState)
      ) {
        setFormError(
          "Please complete all required details before proceeding to checkout.",
        );
        return;
      }
      // Persist rich order details locally for post-payment save
      try {
        const selectedAddOns = Object.entries(selected)
          .filter(([, on]) => !!on)
          .map(([id]) => {
            const item = ADDITIONAL.find((x) => x.id === id);
            return item
              ? { id: item.id, title: item.title, price: item.price }
              : { id, title: id, price: 0 };
          });
        const orderDetails = {
          userId: (user as any).uid || (user as any).id || null,
          email: (user as any).email || null,
          country,
          packageKey: `custom:${pkg.id}`,
          packageTitle: pkg.name,
          amount: total,
          currency: "USD",
          company: {
            ...(country === "USA" ? { state: usState } : {}),
            companyType,
            proposedName: proposedName.trim(),
            serviceType,
            memberType,
          },
          addOns: selectedAddOns,
          features: Array.isArray(pkg.features) ? pkg.features : [],
          couponCode: coupon.trim().toUpperCase() || null,
          couponPercent: couponPercent || 0,
          discountAmount: discount || 0,
          breakdown: {
            planPrice,
            stateFee,
            monthlyFee,
            addOnTotal,
            extraFee,
            discount,
            total,
          },
          savedAt: Date.now(),
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "lastOrderDetails",
            JSON.stringify(orderDetails),
          );
        }
      } catch (_) {}
      // If total is zero, bypass Stripe and record the transaction directly
      if (!(total > 0)) {
        try {
          setCheckoutLoading(true);
          if (!db) throw new Error("Firestore not initialized");
          // Read back order details for consistency
          let orderDetails: any = null;
          try {
            const raw =
              typeof window !== "undefined"
                ? window.localStorage.getItem("lastOrderDetails")
                : null;
            if (raw) orderDetails = JSON.parse(raw);
          } catch {}
          const effectiveUserId =
            orderDetails?.userId ||
            (user as any)?.uid ||
            (user as any)?.id ||
            null;
          if (!effectiveUserId) throw new Error("Missing user");
          const createdAt = Timestamp.now();
          const rawKey = orderDetails?.savedAt
            ? `${effectiveUserId}_${orderDetails.savedAt}`
            : `${effectiveUserId}_${(
                orderDetails?.packageKey ||
                `custom:${pkg.id}` ||
                "pkg"
              ).toString()}_${Math.round(Number(0) * 100)}_USD_${Date.now()}`;
          const txId = rawKey.replace(/[^a-zA-Z0-9_\-]/g, "_");
          const payload: any = {
            userId: effectiveUserId,
            email: orderDetails?.email || (user as any)?.email || null,
            packageKey: orderDetails?.packageKey || `custom:${pkg.id}` || null,
            packageTitle: orderDetails?.packageTitle || pkg.name,
            amount: 0,
            currency: "USD",
            status: "pending",
            createdAt,
            country: orderDetails?.country || (country as any),
            company: orderDetails?.company || null,
            addOns: orderDetails?.addOns || [],
            features: orderDetails?.features || [],
            breakdown: orderDetails?.breakdown ?? null,
            couponCode: orderDetails?.couponCode ?? null,
            couponPercent: orderDetails?.couponPercent ?? 0,
            discountAmount: orderDetails?.discountAmount ?? 0,
          };
          const txDocRef = doc(collection(db, "Transactions"), txId);
          const sanitized = Object.fromEntries(
            Object.entries(payload).filter(([, v]) => v !== undefined),
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
                "",
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
      const isStripe = paymentMethod === "stripe";
      const endpoint = isStripe ? "/api/checkout" : "/api/paypal/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageKey: `custom:${pkg.id}`,
          packageTitle: pkg.name,
          totalAmount: total,
          currency: "USD",
          userId: (user as any).id || (user as any).uid || null,
          customerEmail: (user as any).email || null,
          successPath: "/purchase/success",
          cancelPath: `/purchase/custom/${pkg.id}`,
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
        throw new Error("Invalid checkout session URL");
      }
    } catch (e: any) {
      setCheckoutError(e?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted)
    return <div className="bg-gray-50" style={{ minHeight: "40vh" }} />;

  if (loading)
    return (
      <section className="min-h-[50vh] flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 w-full max-w-md text-center">
          <div className="text-xl font-semibold text-gray-900">
            Loading package…
          </div>
        </div>
      </section>
    );
  if (error || !pkg)
    return (
      <section className="min-h-[50vh] flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 w-full max-w-md text-center">
          <div className="text-xl font-semibold text-rose-600">
            {error || "Package not found"}
          </div>
        </div>
      </section>
    );

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {pkg.name}
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            Review your package, apply coupon, and checkout.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: package */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-800">
                    {pkg.name}
                  </h2>
                  {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                    <ul className="mt-3 grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                      {pkg.features.map((f: string) => (
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
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    ${planPrice}
                  </div>
                  <div className="text-xs text-gray-500">One-time</div>
                </div>
              </div>
            </section>

            {/* Required Details form */}
            <section className="bg-emerald-50 rounded-2xl shadow ring-1 ring-emerald-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4">
                Package Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as "UK" | "USA")}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="UK">United Kingdom</option>
                    <option value="USA">United States</option>
                  </select>
                </div>
                {country === "USA" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      required
                      value={usState}
                      onChange={(e) => setUsState(e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Name
                  </label>
                  <input
                    required
                    type="text"
                    value={proposedName}
                    onChange={(e) => setProposedName(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter proposed name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Type
                  </label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {(country === "USA"
                      ? USA_COMPANY_TYPES
                      : UK_COMPANY_TYPES
                    ).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
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

            {/* Add-ons */}
            <section>
              <h3 className="text-lg font-semibold text-emerald-700 mb-3">
                Additional Services
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {ADDITIONAL.map((item) => (
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
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
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

            {/* Summary + Auth */}
            <section className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Plan Price</span>
                  <span>${planPrice.toFixed(0)}</span>
                </div>
                {country === "USA" && (
                  <div className="flex justify-between">
                    <span>State Filing Fee</span>
                    <span>${stateFee.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Additional Services</span>
                  <span>${addOnTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount ({couponPercent}%)</span>
                  <span>-${discount.toFixed(0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(0)}</span>
                </div>
              </div>

              {authLoading ? (
                <div className="py-2 text-sm text-gray-600">
                  Checking authentication...
                </div>
              ) : user ? (
                <div className="mt-4 space-y-4">
                  {formError && (
                    <div className="text-sm text-red-600">{formError}</div>
                  )}
                  {checkoutError && (
                    <div className="text-sm text-red-600">{checkoutError}</div>
                  )}
                  <>
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={
                        checkoutLoading ||
                        !proposedName.trim() ||
                        !companyType ||
                        !serviceType ||
                        !memberType ||
                        (country === "USA" && !usState)
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-base"
                    >
                      {checkoutLoading
                        ? total > 0
                          ? paymentMethod === "stripe"
                            ? "Redirecting to Stripe..."
                            : "Redirecting to PayPal..."
                          : "Completing..."
                        : total > 0
                          ? "Proceed to Checkout"
                          : "Complete Purchase"}
                    </button>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("stripe")}
                          className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold ${
                            paymentMethod === "stripe"
                              ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                              : "border-gray-300 text-gray-700 bg-white hover:border-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          Stripe
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paypal")}
                          className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold ${
                            paymentMethod === "paypal"
                              ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                              : "border-gray-300 text-gray-700 bg-white hover:border-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          PayPal
                        </button>
                      </div>
                    </div>
                  </>
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
                  {authMode === "existing" ? (
                    <form
                      onSubmit={handleInlineLogin}
                      className="mt-4 space-y-3"
                    >
                      {loginError && (
                        <div className="text-sm text-red-600">{loginError}</div>
                      )}
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={loginSubmitting}
                        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-base"
                      >
                        {loginSubmitting ? "Signing in..." : "Sign In"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="mt-4 space-y-3">
                      {regError && (
                        <div className="text-sm text-red-600">{regError}</div>
                      )}
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={regSubmitting}
                        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-base"
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
