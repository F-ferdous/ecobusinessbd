import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_WEBHOOK_SECRET" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecretKey);
    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      default:
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Webhook error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
