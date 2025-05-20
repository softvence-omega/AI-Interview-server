import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export const createStripeCheckoutSession = async (
  priceId: string,
  userId: string
) => {
  if (!priceId) throw new Error('Missing priceId');
  if (!userId) throw new Error('Missing userId');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url:
      'http://localhost:5173/payment-status?status=success&session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:5173/payment-status?status=cancel',
    metadata: { userId },
  });

  if (!session.url) {
    throw new Error('Failed to create Stripe checkout session URL');
  }

  return session.url;
};

export const stripeInstance = stripe;
