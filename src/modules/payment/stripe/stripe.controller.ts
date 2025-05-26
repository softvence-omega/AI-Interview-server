import { Request, Response } from 'express';
import { createStripeCheckoutSession, stripeInstance } from './stripe.service';
import Stripe from 'stripe';
import { IPayment, Payment } from './stripe.model';
import { ProfileModel } from '../../user/user.model';
import { PlanModel } from '../../plan/plan.model';

/**
 * Utility to save payment data to DB (used by both webhook and manual).
 */
// const savePaymentToDB = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
//   // Check if payment already exists
//   const existing = await Payment.findOne({ sessionId });

//   if (existing) {
//     console.log('ℹ️ Payment already exists for session:', sessionId);
//     return { success: false, message: 'Payment already exists' };
//   }

//   // Fetch full session details from Stripe
//   const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
//     expand: ['line_items.data.price.product'],
//   });

//   const userId = session.metadata?.userId;
//   const subscriptionId = session.subscription as string;
//   const lineItem = session.line_items?.data?.[0];
//   const plan_Id = session.line_items?.data?.[0]?.price?.id || null;
//   const planName = (lineItem?.price?.product as any)?.name || 'unknown-plan';

//   if (!userId) throw new Error('User ID missing from session metadata');

//   const localPlan = await PlanModel.findOne({ priceId: plan_Id})

//   if(!localPlan){
//     console.warn('No matching local plan');
//   }

//   // Save payment in DB
//   const payment: IPayment = await Payment.create({
//     userId,
//     subscriptionId,
//     sessionId,
//     planId: plan_Id,
//     status: 'active',
//   });


//   // update the user's profile
//   await ProfileModel.findOneAndUpdate(
//     { user_id: userId },
//     {
//       $push: {
//         paymentId: payment._id,
//         stripeSubscriptionId: subscriptionId,
//         ...(localPlan?._id ? { plan_id: localPlan._id } : {} ),
//       },
//       $set: {
//         currentPlan: planName,
//       },
//     },
//     { new : true }
//   );

//   console.log('✅ Payment saved for user:', userId);
//   return { success: true, message: 'Payment saved successfully' };
// };

const savePaymentToDB = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
  const existing = await Payment.findOne({ sessionId });

  if (existing) {
    console.log('ℹ️ Payment already exists for session:', sessionId);
    return { success: false, message: 'Payment already exists' };
  }

  const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price.product'],
  });

  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  const lineItem = session.line_items?.data?.[0];
  const planStripePriceId = lineItem?.price?.id || null;
  const planName = (lineItem?.price?.product as any)?.name || 'unknown-plan';

  if (!userId) throw new Error('User ID missing from session metadata');

  const localPlan = await PlanModel.findOne({ priceId: planStripePriceId });
  if (!localPlan) console.warn('⚠️ No matching local plan found for priceId:', planStripePriceId);

  // Save payment in DB
  const payment: IPayment = await Payment.create({
    userId,
    subscriptionId,
    sessionId,
    planId: planStripePriceId,
    status: 'active',
  });

  // Determine new interviewsAvailable
  const updateFields: any = {
    currentPlan: planName,
    $push: {
      paymentId: payment._id,
      stripeSubscriptionId: subscriptionId,
      ...(localPlan?._id ? { plan_id: localPlan._id } : {}),
    },
  };

  if (planName.toLowerCase().includes('premium')) {
    const profile = await ProfileModel.findOne({ user_id: userId });
    const currentAvailable = profile?.interviewsAvailable ?? 0;

    updateFields.interviewsAvailable = currentAvailable + 10;
  } else if (planName.toLowerCase().includes('pay-per')) {
    const profile = await ProfileModel.findOne({ user_id: userId });
    const currentAvailable = profile?.interviewsAvailable ?? 0;

    updateFields.interviewsAvailable = currentAvailable + 1;
      // currentAvailable === 'unlimited' ? 1 : 
  }

  await ProfileModel.findOneAndUpdate({ user_id: userId }, updateFields, { new: true });

  console.log('✅ Payment saved and profile updated for user:', userId);
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
