import cron from 'node-cron';
import { ProfileModel } from '../../../user/user.model';
import { Payment } from '../../payment.model';

cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily subscription check...');

  const now = new Date();

  const profiles = await ProfileModel.find({
    currentPlan: { $in: ['premium', 'pay-per'] },
  });

  for (const profile of profiles) {
    const latestPayment = await Payment.findOne({ userId: profile.user_id })
      .sort({ createdAt: -1 });

    if (!latestPayment) continue;

    const createdAt = new Date(latestPayment.createdAt);
    const daysSincePurchase = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (profile.currentPlan === 'premium' && daysSincePurchase >= 30) {
      await ProfileModel.findByIdAndUpdate(profile._id, {
        $set: {
          currentPlan: 'free',
          interviewsAvailable: 0,
        },
      });
      console.log(`🔁 Premium plan reset for user ${profile.user_id}`);
    }

    if (
      profile.currentPlan === 'pay-per' &&
      (profile.interviewTaken >= 1 || daysSincePurchase >= 1)
    ) {
      await ProfileModel.findByIdAndUpdate(profile._id, {
        $set: {
          currentPlan: 'free',
          interviewsAvailable: 0,
        },
      });
      console.log(`🔁 Pay-per plan reset for user ${profile.user_id}`);
    }
  }
});
