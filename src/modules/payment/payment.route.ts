import express from 'express';
import PaymentController from './payment.controller';

const router = express.Router();

router.post('/create-payment-intent', PaymentController.createCheckout);
// router.post('/confirm-payment', PaymentController.confirmIntent);
router.post('/verify-payment', PaymentController.verifyPayment);

export default router;
