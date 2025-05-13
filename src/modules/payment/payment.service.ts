import { stripe } from './utils/payment';

export const createPaymentIntent = async (amount: number, userId: string) => {
  return await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: 'usd',
    metadata: { userId },
  });
};

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};
