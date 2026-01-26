import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

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
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      return new Response(
        JSON.stringify({ error: "Missing PAYPAL_WEBHOOK_ID" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const transmissionId = req.headers.get("paypal-transmission-id") || "";
    const transmissionTime = req.headers.get("paypal-transmission-time") || "";
    const certUrl = req.headers.get("paypal-cert-url") || "";
    const authAlgo = req.headers.get("paypal-auth-algo") || "";
    const transmissionSig = req.headers.get("paypal-transmission-sig") || "";

    const event = await req.json();

    const token = await getAccessToken();

    const verifyRes = await fetch(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: event,
        }),
      },
    );

    if (!verifyRes.ok) {
      const txt = await verifyRes.text();
      return new Response(
        JSON.stringify({ error: `Webhook verify failed: ${txt}` }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const verifyData = (await verifyRes.json()) as {
      verification_status?: string;
    };
    if (verifyData.verification_status !== "SUCCESS") {
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      await adminDb
        .collection("PayPalEvents")
        .doc(String(event?.id || `${Date.now()}`))
        .set(
          {
            type: event?.event_type || null,
            resource: event?.resource || null,
            status: "received",
            createdAtMs: Date.now(),
          },
          { merge: true },
        );
    } catch {}

    if (event?.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      // Optional: extend here to reconcile with Transactions
    }

    return new Response("OK", { status: 200 });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Webhook error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
