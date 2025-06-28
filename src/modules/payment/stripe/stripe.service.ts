import Stripe from 'stripe';
import { Payment } from './stripe.model';
import { sendEmail } from '../../../util/sendEmail';
import { generateEmailTemplate } from '../../../util/emailTemplate';
import { sendSingleNotification } from '../../firebaseSetup/sendPushNotification';
import { UserModel } from '../../user/user.model';
import config from '../../../config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

const priceIdToPlanTypeMap: Record<string, string> = {
  'price_1RQh51AeQO2CXKLXBTbmxa3M': 'premium',
  'price_1RQh5lAeQO2CXKLX0brJrWGJ': 'pay-per',
};

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
      `${config.FRONTEND_URL}/payment-status?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.FRONTEND_URL}/payment-status?status=cancel`,
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

  // Get priceId from the line items
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
  const priceId = lineItems.data[0]?.price?.id;

  const planType = priceId ? priceIdToPlanTypeMap[priceId] || 'unknown' : 'unknown';

  const paymentData = {
    sessionId: session.id,
    userId: session.metadata?.userId,
    amount: session.amount_total,
    currency: session.currency,
    status: session.payment_status,
    paymentMethod: session.payment_method_types?.[0] || 'unknown',
    email: session.customer_email || 'unknown',
    planType,
  };

  // Save payment to DB
  const saved = await Payment.create(paymentData);
  console.log('✅ Payment saved to DB:', saved);

  // Get user
  const user = await UserModel.findById(paymentData.userId);
  if (!user) {
    console.error('❌ User not found for ID:', paymentData.userId);
    return saved;
  }

  // Setup email + notification content
  let emailSubject = 'Payment Successful!';
  let emailBody = generateEmailTemplate({
    title: 'Payment Successful',
    message: `Thank you for your payment.`,
    ctaText: 'Visit Dashboard',
    ctaLink: 'https://cerulean-pavlova-50e690.netlify.app/userDashboard/mockInterview',
  });
  let notificationMessage = 'Your payment was processed successfully.';

  if (paymentData.planType === 'premium') {
    emailSubject = '🎉 Your Plan Has Been Successfully Upgraded!';
    emailBody = generateEmailTemplate({
      title: '🎉 Your Plan Has Been Successfully Upgraded!',
      message: `
        Your account has been upgraded to the <strong>Premium Plan</strong>!
        <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
          <li>✅ Unlimited interview simulations</li>
          <li>✅ Personalized feedback</li>
          <li>✅ Downloadable reports</li>
          <li>✅ Exclusive AI tools</li>
        </ul>
      `,
      ctaText: 'Go to Dashboard',
      ctaLink: 'https://cerulean-pavlova-50e690.netlify.app/userDashboard/mockInterview',
    });
    notificationMessage = 'Your account has been upgraded to the Premium Plan!';
  } else if (paymentData.planType === 'pay-per') {
    emailSubject = 'Thank You for Your Pay-Per-Interview Purchase!';
    emailBody = generateEmailTemplate({
      title: 'Thank You for Your Pay-Per-Interview Purchase!',
      message: `
        You have purchased an interview simulation credit.
        <br /><br />
        Use it to practice and receive feedback.
      `,
      ctaText: 'Start Interview',
      ctaLink: 'https://cerulean-pavlova-50e690.netlify.app/userDashboard/mockInterview',
    });
    notificationMessage = 'You have successfully purchased a Pay-Per-Interview credit.';
  }

  try {
    // Check if email is valid
    if (user.email) {
      const emailResponse = await sendEmail(user.email, emailSubject, emailBody);
      console.log('✅ Email sent:', emailResponse);
    } else {
      console.warn('⚠️ No email found for user:', user._id);
    }

    // Send in-app push notification
    const notifResponse = await sendSingleNotification(user._id, emailSubject, notificationMessage);
    console.log('✅ Notification sent:', notifResponse);
  } catch (err) {
    console.error('❌ Error sending email or notification:', err);
  }

  return saved;
};



export const stripeInstance = stripe;
