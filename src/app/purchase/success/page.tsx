"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

function SuccessWriter() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const ran = React.useRef(false); // prevent duplicate writes in StrictMode

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const status = (params.get("status") || "").toLowerCase();
    const paymentMethod = (params.get("payment") || "").toLowerCase();
    const pkg = params.get("pkg") || "";
    const titleFromQuery = params.get("title") || "";
    const amountFromQuery = Number(params.get("amount") || "0");
    const currency = (params.get("currency") || "USD").toUpperCase();

    let cancelled = false;

    (async () => {
      try {
        if (!db) throw new Error("Firestore not initialized");
        if (status !== "success") throw new Error("Payment not successful");

        setSaving(true);
        setError("");

        // Load last order details from checkout page
        let orderDetails: any = null;
        try {
          const raw =
            typeof window !== "undefined"
              ? window.localStorage.getItem("lastOrderDetails")
              : null;
          if (raw) orderDetails = JSON.parse(raw);
        } catch {}

        const effectiveUserId = orderDetails?.userId || null;
        const email = orderDetails?.email || null;
        const amount =
          amountFromQuery > 0
            ? amountFromQuery
            : Number(orderDetails?.amount || 0);

        if (!effectiveUserId) throw new Error("Missing user");
        if (!(amount > 0)) throw new Error("Invalid amount");

        const createdAt = Timestamp.now();
        // Prefer deterministic id (savedAt) for idempotency; otherwise include time to avoid collisions
        const rawKey = orderDetails?.savedAt
          ? `${effectiveUserId}_${orderDetails.savedAt}`
          : `${effectiveUserId}_${(
              orderDetails?.packageKey ||
              pkg ||
              "pkg"
            ).toString()}_${Math.round(
              Number(amount) * 100,
            )}_${currency}_${Date.now()}`;
        const txId = rawKey.replace(/[^a-zA-Z0-9_\-]/g, "_");

        const payload: any = {
          userId: effectiveUserId,
          email,
          packageKey: orderDetails?.packageKey || pkg || null,
          packageTitle:
            titleFromQuery || orderDetails?.packageTitle || (pkg ? pkg : null),
          amount,
          currency,
          status: "pending",
          createdAt,
          country: orderDetails?.country || null,
          company: orderDetails?.company || null,
          addOns: orderDetails?.addOns || [],
          features: orderDetails?.features || [],
          breakdown: orderDetails?.breakdown ?? null,
          couponCode: orderDetails?.couponCode ?? null,
          couponPercent: orderDetails?.couponPercent ?? 0,
          discountAmount: orderDetails?.discountAmount ?? 0,
          paymentMethod: paymentMethod || "unknown",
        };

        const txDocRef = doc(collection(db, "Transactions"), txId);
        const sanitized = Object.fromEntries(
          Object.entries(payload).filter(([, v]) => v !== undefined),
        );
        await setDoc(txDocRef, sanitized, { merge: true });

        if (!cancelled) {
          // Clean URL and local storage
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete("status");
            url.searchParams.delete("pkg");
            url.searchParams.delete("amount");
            url.searchParams.delete("currency");
            url.searchParams.delete("title");
            window.history.replaceState({}, "", url.toString());
            window.localStorage.removeItem("lastOrderDetails");
          } catch {}
          // Redirect to purchases
          try {
            const base =
              (process.env.NEXT_PUBLIC_BASE_URL as string) ||
              (typeof window !== "undefined" ? window.location.origin : "");
            const target = `${base.replace(
              /\/$/,
              "",
            )}/user/dashboard/purchases`;
            window.location.assign(target);
          } catch {
            router.replace("/user/dashboard/purchases");
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to save order");
      } finally {
        if (!cancelled) setSaving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <section className="min-h-[50vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 w-full max-w-md text-center">
        <div className="text-xl font-semibold text-gray-900">
          {saving ? "Recording your purchase…" : "Processing your order…"}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Please wait while we record your purchase.
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>
    </section>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <section className="min-h-[50vh] flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 w-full max-w-md text-center">
            <div className="text-xl font-semibold text-gray-900">
              Processing…
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Preparing your success page…
            </div>
          </div>
        </section>
      }
    >
      <SuccessWriter />
    </React.Suspense>
  );
}
