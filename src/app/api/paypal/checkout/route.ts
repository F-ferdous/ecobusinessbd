import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const client = process.env.PAYPAL_CLIENT_ID;
  // Support both PAYPAL_SECRET_KEY (preferred) and PAYPAL_CLIENT_SECRET (fallback)
  const secret =
    process.env.PAYPAL_SECRET_KEY || process.env.PAYPAL_CLIENT_SECRET;
  if (!client || !secret) {
    const missing: string[] = [];
    if (!client) missing.push("PAYPAL_CLIENT_ID");
    if (!secret) missing.push("PAYPAL_SECRET_KEY/PAYPAL_CLIENT_SECRET");
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
    const {
      packageKey,
      packageTitle,
      totalAmount,
      currency = "USD",
      successPath = "/user/dashboard/purchases",
      cancelPath = "/",
    } = body || {};

    if (!totalAmount || Number(totalAmount) <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = await getAccessToken();

    const reqUrl = new URL(req.url);
    const inferredBase = `${reqUrl.protocol}//${reqUrl.host}`;
    const envBase = process.env.NEXT_PUBLIC_BASE_URL;
    const isLocal =
      /localhost/i.test(reqUrl.host) ||
      /^127\.0\.0\.1(?::\d+)?$/.test(reqUrl.host);
    const baseUrl = isLocal ? inferredBase : envBase || inferredBase;

    const return_url = `${baseUrl}${successPath}?status=success&payment=paypal&pkg=${encodeURIComponent(
      String(packageKey || ""),
    )}&amount=${encodeURIComponent(String(totalAmount))}&currency=${encodeURIComponent(
      String(currency),
    )}&title=${encodeURIComponent(String(packageTitle || "Service Package"))}`;
    const cancel_url = `${baseUrl}${cancelPath}?status=cancel&payment=paypal&pkg=${encodeURIComponent(
      String(packageKey || ""),
    )}&amount=${encodeURIComponent(String(totalAmount))}&currency=${encodeURIComponent(
      String(currency),
    )}&title=${encodeURIComponent(String(packageTitle || "Service Package"))}`;

    const createOrderRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: String(currency).toUpperCase(),
                value: String(Number(totalAmount).toFixed(2)),
              },
              description: packageKey
                ? `Package: ${packageKey}`
                : packageTitle || "Service Package",
            },
          ],
          application_context: {
            brand_name: process.env.NEXT_PUBLIC_SITE_NAME || "EcoBusiness",
            user_action: "PAY_NOW",
            landing_page: "LOGIN",
            return_url,
            cancel_url,
          },
        }),
      },
    );

    if (!createOrderRes.ok) {
      const errTxt = await createOrderRes.text();
      return new Response(
        JSON.stringify({ error: `PayPal order failed: ${errTxt}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const order = (await createOrderRes.json()) as any;
    const approveLink: string | undefined = Array.isArray(order?.links)
      ? (order.links.find((l: any) => l?.rel === "approve")?.href as
          | string
          | undefined)
      : undefined;

    if (!approveLink) {
      return new Response(
        JSON.stringify({ error: "Missing PayPal approval URL" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ url: approveLink }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("PayPal checkout error:", e);
    const message =
      e instanceof Error ? e.message : "Failed to start PayPal checkout";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
