// const express = require('express');
// require('dotenv').config();
// require('stripe')(process.env.STRIPE_SECRET_KEY);

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2025-02-24.acacia', // You can set the Stripe API version here
// });

// const app = express();

// app.post('create-checkout-session', async (req, res) => {
//   try {
//     const {priceId} = req.body;

//     await stripe.checkout.session.create({
//         mode: 'subscription',
//         payment_method_types: ['card'],
//         line_items: [
//             {
//                 price: priceId,
//                 quantity: 1,
//             }
//         ],
//         success_url: 'http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}',
//         cancel_url: 'http:.//localhost:5000/cancel'
//     })

//     res.json({url:sessionStorage.url})
//   } catch (error){
//     console.log(error);
//     res.status(500).json(error.message)
//   }
// });
