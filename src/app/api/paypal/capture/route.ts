import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const PAYPAL_API_BASE = "https://api-m.paypal.com";

async function getAccessToken() {
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!client || !secret) {
    const missing: string[] = [];
    if (!client) missing.push("PAYPAL_CLIENT_ID");
    if (!secret) missing.push("PAYPAL_CLIENT_SECRET");
    throw new Error(`PayPal not configured: missing ${missing.join(", ")}`);
  }
  const auth = Buffer.from(`${client}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`PayPal auth failed: ${errTxt}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Missing PayPal access token");
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, userId, packageKey, packageTitle, amount, currency } =
      body || {};

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = await getAccessToken();

    // 1. Check if already captured (duplicate capture prevention)
    try {
      const existingTx = await adminDb
        .collection("Transactions")
        .where("orderId", "==", orderId)
        .limit(1)
        .get();
      if (!existingTx.empty) {
        const existing = existingTx.docs[0].data();
        return new Response(
          JSON.stringify({
            success: true,
            orderId,
            captureId: existing.captureId,
            status: existing.paypalStatus,
            amount: existing.amount,
            currency: existing.currency,
            alreadyCaptured: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    } catch {
      // Continue to capture if check fails
    }

    // 2. Verify order status with PayPal (prevent fake orderId attacks)
    const orderCheckRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!orderCheckRes.ok) {
      return new Response(
        JSON.stringify({ error: "Order not found or invalid" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const orderData = (await orderCheckRes.json()) as any;
    if (orderData.status !== "APPROVED") {
      return new Response(
        JSON.stringify({
          error: `Order status is ${orderData.status}, expected APPROVED`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // 3. Capture the payment
    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({}),
      },
    );

    if (!captureRes.ok) {
      const errTxt = await captureRes.text();
      return new Response(
        JSON.stringify({ error: `PayPal capture failed: ${errTxt}` }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const captureData = (await captureRes.json()) as any;

    // Check capture status - read amount/currency from PayPal response only (security)
    const captureStatus = captureData?.status;
    const purchaseUnit = captureData?.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const captureId = capture?.id;
    const captureAmount = capture?.amount?.value;
    const captureCurrency = capture?.amount?.currency_code;
    const captureStatus_detail = capture?.status;

    // Use PayPal values only - ignore frontend values for security
    const finalAmount = Number(captureAmount);
    const finalCurrency = captureCurrency;

    if (!finalAmount || !finalCurrency) {
      return new Response(
        JSON.stringify({ error: "Invalid capture data from PayPal" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (captureStatus !== "COMPLETED" && captureStatus_detail !== "COMPLETED") {
      return new Response(
        JSON.stringify({
          error: `Capture not completed: ${captureStatus}`,
          captureData,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Store transaction to Firestore
    try {
      const txId = `paypal_${orderId}`;
      const payload = {
        userId: userId || null,
        packageKey: packageKey || null,
        packageTitle: packageTitle || null,
        amount: finalAmount,
        currency: finalCurrency,
        status: "completed",
        paymentMethod: "paypal",
        orderId: orderId,
        captureId: captureId || null,
        paypalStatus: captureStatus,
        createdAt: new Date(),
        capturedAt: new Date(),
        rawResponse: captureData,
      };

      await adminDb.collection("Transactions").doc(txId).set(payload);
    } catch (e) {
      console.error("Failed to store transaction:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        captureId,
        status: captureStatus,
        amount: finalAmount,
        currency: finalCurrency,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("PayPal capture error:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Capture failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
