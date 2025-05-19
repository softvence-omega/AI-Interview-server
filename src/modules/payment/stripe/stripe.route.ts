import express from 'express';
import { Router } from 'express';
import { PaymentController } from './stripe.controller';

const PaymentRoutes = Router();

// Route to create a payment intent
PaymentRoutes.post('/payment-intent', PaymentController.createPaymentIntent);

// Route to create a checkout session
PaymentRoutes.post('/checkout-session', PaymentController.createCheckoutSession);

// Webhook route to handle events from Stripe
PaymentRoutes.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.handleWebhook);

export default PaymentRoutes;
