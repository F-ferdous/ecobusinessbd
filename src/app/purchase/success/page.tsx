"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function PurchaseSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [uid, setUid] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [saved, setSaved] = React.useState(false);
  const [didAttempt, setDidAttempt] = React.useState(false);

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || null);
      setEmail(u?.email || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    const status = (params.get("status") || "").toLowerCase();
    const pkg = params.get("pkg") || "";
    const titleFromQuery = params.get("title") || "";
    const amountFromQuery = Number(params.get("amount") || "0");
    const currency = (params.get("currency") || "USD").toUpperCase();

    let cancelled = false;
    (async () => {
      try {
        if (!db) throw new Error("Firestore not initialized");
        if (saved || saving) return;
        if (status !== "success") return;
        // Ensure we wait for auth resolution to avoid permission errors
        if (!authReady) return;
        setDidAttempt(true);
        // Load last rich order details saved by the purchase page
        let orderDetails: any = null;
        try {
          if (typeof window !== "undefined") {
            const raw = window.localStorage.getItem("lastOrderDetails");
            if (raw) orderDetails = JSON.parse(raw);
          }
        } catch {}
        const effectiveUserId = uid || orderDetails?.userId || null;
        const amount =
          amountFromQuery > 0
            ? amountFromQuery
            : Number(orderDetails?.amount || 0);
        if (!effectiveUserId) throw new Error("Missing user");
        if (!(amount > 0)) throw new Error("Invalid amount");

        setSaving(true);
        setError("");
        const createdAt = Timestamp.now();
        // Build deterministic transaction id for idempotency
        const rawKey = orderDetails?.savedAt
          ? `${effectiveUserId}_${orderDetails.savedAt}`
          : `${effectiveUserId}_${(
              orderDetails?.packageKey ||
              pkg ||
              "pkg"
            ).toString()}_${Math.round(Number(amount) * 100)}_${currency}`;
        const txId = rawKey.replace(/[^a-zA-Z0-9_\-]/g, "_");

        const payload: any = {
          userId: effectiveUserId,
          email: email || null,
          packageKey: orderDetails?.packageKey || pkg || null,
          packageTitle:
            titleFromQuery || orderDetails?.packageTitle || (pkg ? pkg : null),
          amount,
          currency,
          status: "pending",
          createdAt,
        };
        if (orderDetails) {
          payload.country = orderDetails.country || null;
          payload.company = orderDetails.company || null;
          payload.addOns = orderDetails.addOns || [];
          payload.features = orderDetails.features || [];
          payload.breakdown = orderDetails.breakdown || undefined;
          // Carry coupon details if present
          if (orderDetails.couponCode)
            payload.couponCode = orderDetails.couponCode;
          if (typeof orderDetails.couponPercent !== "undefined")
            payload.couponPercent = orderDetails.couponPercent;
          if (typeof orderDetails.discountAmount !== "undefined")
            payload.discountAmount = orderDetails.discountAmount;
        }
        // Idempotent write to Transactions
        const txDocRef = doc(collection(db, "Transactions"), txId);
        const existingTx = await getDoc(txDocRef);
        if (!existingTx.exists()) {
          await setDoc(txDocRef, payload, { merge: true });
        }
        // Mirror to PendingOrders using same id
        try {
          const packageName =
            payload.packageTitle || payload.packageKey || "Service Package";
          const totalAmount = Number(payload.amount || 0);
          const country = payload.country || null;
          const pendingRef = doc(collection(db, "PendingOrders"), txId);
          const existingPending = await getDoc(pendingRef);
          if (!existingPending.exists()) {
            await setDoc(
              pendingRef,
              {
                packageName,
                userId: effectiveUserId,
                status: "pending",
                country,
                totalAmount,
                createdAt,
                transactionId: txId,
                // copy coupon fields
                couponCode: payload.couponCode || null,
                couponPercent: payload.couponPercent || 0,
                discountAmount: payload.discountAmount || 0,
              },
              { merge: true }
            );
          }
        } catch (e) {
          // Non-blocking mirror failure
          console.error("Failed to create PendingOrders entry", e);
        }
        if (!cancelled) setSaved(true);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to save order");
      } finally {
        if (!cancelled) setSaving(false);
        if (!didAttempt) return;
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("status");
          url.searchParams.delete("pkg");
          url.searchParams.delete("amount");
          url.searchParams.delete("currency");
          url.searchParams.delete("title");
          window.history.replaceState({}, "", url.toString());
          if (typeof window !== "undefined")
            window.localStorage.removeItem("lastOrderDetails");
        } catch {}
        try {
          const base =
            (process.env.NEXT_PUBLIC_BASE_URL as string) ||
            (typeof window !== "undefined" ? window.location.origin : "");
          const target = `${base.replace(/\/$/, "")}/user/dashboard/purchases`;
          window.location.assign(target);
        } catch (e) {
          try {
            router.replace("/user/dashboard/purchases");
          } catch {}
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, uid, email, saving, saved, router]);

  return (
    <section className="min-h-[50vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6 w-full max-w-md text-center">
        <div className="text-xl font-semibold text-gray-900">
          Processing your order…
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
      <PurchaseSuccessContent />
    </React.Suspense>
  );
}
