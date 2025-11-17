import Stripe from 'stripe';

// Ensure this route runs in Node.js runtime (Stripe SDK requires Node, not Edge)
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      packageKey,
      packageTitle,
      totalAmount,
      currency = 'USD',
      userId,
      successPath = '/user/dashboard/purchases',
      cancelPath = '/purchase/us/purchase',
    } = body || {};

    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
    }
    if (!totalAmount || totalAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const reqUrl = new URL(req.url);
    const inferredBase = `${reqUrl.protocol}//${reqUrl.host}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || inferredBase;
    const success_url = `${baseUrl}${successPath}?status=success&pkg=${encodeURIComponent(packageKey || '')}&amount=${encodeURIComponent(String(totalAmount))}&currency=${encodeURIComponent(String(currency))}&title=${encodeURIComponent(String(packageTitle || 'Service Package'))}`;
    const cancel_url = `${baseUrl}${cancelPath}?status=cancel&pkg=${encodeURIComponent(packageKey || '')}&amount=${encodeURIComponent(String(totalAmount))}&currency=${encodeURIComponent(String(currency))}&title=${encodeURIComponent(String(packageTitle || 'Service Package'))}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: body?.customerEmail,
      metadata: {
        userId: userId || '',
        packageKey: packageKey || '',
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(Number(totalAmount) * 100),
            product_data: {
              name: packageTitle || 'Service Package',
              description: packageKey ? `Package: ${packageKey}` : undefined,
            },
          },
        },
      ],
      success_url,
      cancel_url,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    // Log server-side for local debugging
    console.error('Stripe checkout session error:', e);
    const message = e instanceof Error ? e.message : 'Failed to create checkout session';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
