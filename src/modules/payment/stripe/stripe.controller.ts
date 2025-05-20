import { Request, Response } from 'express';
import { createStripeCheckoutSession, stripeInstance } from './stripe.service';
import Stripe from 'stripe';
import { Payment } from './stripe.model';

/**
 * Utility to save payment data to DB (used by both webhook and manual).
 */
const savePaymentToDB = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
  // Check if payment already exists
  const existing = await Payment.findOne({ sessionId });

  if (existing) {
    console.log('ℹ️ Payment already exists for session:', sessionId);
    return { success: false, message: 'Payment already exists' };
  }

  // Fetch full session details from Stripe
  const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });

  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  const planId = session.line_items?.data?.[0]?.price?.id || null;

  if (!userId) throw new Error('User ID missing from session metadata');

  // Save payment in DB
  await Payment.create({
    userId,
    subscriptionId,
    sessionId,
    planId,
    status: 'active',
  });

  console.log('✅ Payment saved for user:', userId);
  return { success: true, message: 'Payment saved successfully' };
};

/**
 * POST /api/v1/payment/checkout-session
 * Creates a Stripe Checkout Session.
 */
const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priceId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const sessionUrl = await createStripeCheckoutSession(priceId, userId);
    res.json({ url: sessionUrl });
  } catch (error: any) {
    console.error('❌ Create checkout session error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/v1/payment/webhook
 * Stripe Webhook Handler
 */
const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.log('⚠️ Webhook signature verification failed.', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const sessionId = session.id;
      await savePaymentToDB(sessionId);
    } catch (error) {
      console.error('❌ Failed to save payment via webhook:', error);
    }
  }

  res.status(200).json({ received: true });
};

/**
 * POST /api/v1/payment/save-payment
 * Manual backup endpoint to save payment (if webhook fails).
 */
const savePaymentManually = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ message: 'Session ID is required' });
    return;
  }

  try {
    const result = await savePaymentToDB(sessionId);
    res.status(200).json({ message: result.message });
  } catch (err) {
    console.error('❌ Manual save payment failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Exported controller object
 */
const StripeController = {
  createCheckoutSession,
  handleWebhook,
  savePaymentManually,
};

export default StripeController;
