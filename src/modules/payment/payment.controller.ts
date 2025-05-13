import { Request, Response } from 'express';
import { PlanModel } from '../plan/plan.model';
import { UserModel } from '../user/user.model';
import mongoose from 'mongoose';
import { stripe } from './utils/payment';
import catchAsync from '../../util/catchAsync';

// Create Stripe Checkout Session
const createCheckout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { planId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }
  
    const plan = await PlanModel.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
  
    // try {
    //   const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     mode: 'payment',
    //     line_items: [
    //       {
    //         price_data: {
    //           currency: 'usd',
    //           product_data: {
    //             name: plan.name,
    //             description: plan.description,
    //           },
    //           unit_amount: 10 * 100,
    //         },
    //         quantity: 1,
    //       },
    //     ],
    //     success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    //     cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    //     metadata: {
    //       userId,
    //     //   planId: plan._id.toString(),
    //     },
    //   });
  
    //   res.status(200).json({ url: session.url });
    // } catch (error) {
    //   console.error('Checkout creation failed:', error);
    //   res.status(500).json({ message: 'Failed to create checkout session' });
    // }
  }
)


// Verify Stripe Checkout Session
const verifyPayment = catchAsync(async (req: Request, res: Response) => {
    const { session_id } = req.query;
  
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid session_id' });
    }
  
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
  
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
  
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
  
      if (!userId || !planId) {
        return res.status(400).json({ message: 'Missing session metadata' });
      }
  
      await UserModel.findByIdAndUpdate(userId, {
        currentPlan: planId,
        planActivatedAt: new Date(),
      });
  
      res.status(200).json({ message: 'Plan activated successfully' });
    } catch (error) {
      console.error('Payment verification failed:', error);
      res.status(500).json({ message: 'Failed to verify payment' });
    }
  }
)

  


// const createIntent = catchAsync(async (req: Request, res: Response) => {
//     try {
//         const { amount, userId } = req.body;
    
//         // Create a new checkout session
//         const session = await stripe.checkout.sessions.create({
//           payment_method_types: ['card'],
//           line_items: [
//             {
//               price_data: {
//                 currency: 'usd',
//                 product_data: {
//                   name: 'Sample Product',
//                 },
//                 unit_amount: amount * 100, // amount in cents
//               },
//               quantity: 1,
//             },
//           ],
//           mode: 'payment',
//           success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//           cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//           metadata: { userId },
//         });
    
//         // Send the session ID back to the frontend
//         res.json({ id: session.id });
//       } catch (err) {
//         console.error(err);
//         res.status(500).send('Error creating checkout session');
//       }
//   }
// );

// const confirmIntent = catchAsync(async (req: Request, res: Response) => {
//     try {
//       const { paymentIntentId, userId } = req.body;
  
//       const intent = await retrievePaymentIntent(paymentIntentId);
  
//       const payment = new Payment({
//         userId,
//         amount: intent.amount / 100,
//         currency: intent.currency,
//         paymentIntentId: intent.id,
//         status: intent.status,
//       });
  
//       await payment.save();
  
//       res.status(201).json({ message: 'Payment saved', payment });
//     } catch (err) {
//       res.status(500).json({ error: 'Failed to save payment' });
//     }
//   }
// );




const PaymentController = {
    createCheckout,
    verifyPayment
}
export default PaymentController;