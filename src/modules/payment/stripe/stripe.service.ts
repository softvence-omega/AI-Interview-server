import Stripe from 'stripe';
import { Payment } from './stripe.model';

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

// Check if session is paid
export const verifyStripePaymentSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session || session.payment_status !== 'paid') {
    throw new Error('Payment not completed or invalid session');
  }

  return session;
};

// Save to DB after successful verification
export const savePaymentToDB = async (sessionId: string) => {
  const session = await verifyStripePaymentSession(sessionId);

  const paymentData = {
    sessionId: session.id,
    userId: session.metadata?.userId,
    amount: session.amount_total,
    currency: session.currency,
    status: session.payment_status,
    paymentMethod: session.payment_method_types?.[0] || 'unknown',
    email: session.customer_email || 'unknown',
  };

  const saved = await Payment.create(paymentData);
  return saved;
};

export const stripeInstance = stripe;
