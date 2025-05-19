import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

export class PaymentController {
  // Endpoint to create a payment intent
  static async createPaymentIntent(req: Request, res: Response) {
    try {
      const { amount, currency } = req.body;
      const paymentIntent = await StripeService.createPaymentIntent(amount, currency);
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error : any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Endpoint to create a checkout session
  static async createCheckoutSession(req: Request, res: Response) {
    try {
      const { successUrl, cancelUrl, lineItems } = req.body;
      const session = await StripeService.createCheckoutSession(successUrl, cancelUrl, lineItems);
      res.status(200).json({ sessionId: session.id });
    } catch (error : any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Endpoint to handle Stripe webhook events
  static async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const payload = req.body;

    try {
      await StripeService.handleWebhook(payload, sig);
      res.status(200).json({ message: 'Event handled' });
    } catch (error : any) {
      res.status(400).json({ error: 'Webhook error: ' + error.message });
    }
  }
}
