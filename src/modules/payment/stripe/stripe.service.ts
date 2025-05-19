import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia', // You can set the Stripe API version here
});

export class StripeService {
  // Create a payment intent
  static async createPaymentIntent(amount: number, currency: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      throw new Error('Error creating payment intent');
    }
  }

  // Create a checkout session for redirecting the user
  static async createCheckoutSession(
    successUrl: string,
    cancelUrl: string,
    lineItems: { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }[]
  ) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return session;
    } catch (error) {
      throw new Error('Error creating checkout session');
    }
  }

  // Handle webhook events from Stripe
  static async handleWebhook(payload: string, sig: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      throw new Error('Webhook signature verification failed.');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent was successful: ${paymentIntent.id}`);
        break;
      case 'payment_intent.payment_failed':
        const paymentFailed = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentFailed.id}`);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
