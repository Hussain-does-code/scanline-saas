import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' // Use a supported API version instead of just '2023-10-16'
});

export async function createCheckoutSession(userId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log(`[MOCK STRIPE] Created checkout session for ${userId}`);
    return "https://mock-stripe-checkout.com/session";
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Scanline Pro',
            description: 'Unlimited repos, real-time webhook scans, priority translation.',
          },
          unit_amount: 1900,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: 'https://scanline.app/dashboard?success=true',
    cancel_url: 'https://scanline.app/settings',
    client_reference_id: userId,
  });

  return session.url;
}
