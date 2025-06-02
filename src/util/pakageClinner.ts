// src/util/pakageClinner.ts
import moment from 'moment-timezone';
import cron from 'node-cron';
import { ProfileModel } from '../modules/user/user.model';
import { Payment } from '../modules/payment/stripe/stripe.model';

moment.tz.setDefault('Asia/Dhaka');

const PREMIUM_PLAN_ID = "price_1RQh51AeQO2CXKLXBTbmxa3M";

const cleanSubscriptions = async () => {
    try {
      // Define the start and end of the day exactly 30 days ago
      const startOfTargetDay = moment().subtract(30, 'days').startOf('day').toDate();
      const endOfTargetDay = moment().subtract(30, 'days').endOf('day').toDate();
  
      // Step 1: Find payments created exactly 30 days ago with the premium plan
      const recentPremiumPayments = await Payment.find({
        createdAt: { $gte: startOfTargetDay, $lte: endOfTargetDay },
        planId: PREMIUM_PLAN_ID,
      });
  
      if (!recentPremiumPayments.length) {
        console.log('No premium payments exactly 30 days old found.');
        return;
      }
  
      const userIds = recentPremiumPayments.map((payment) => payment.userId);
  
      // Step 2: Update the user profiles
      const updateResult = await ProfileModel.updateMany(
        { user_id: { $in: userIds } },
        {
          $set: {
            currentPlan: 'free',
            interviewsAvailable: 0,
          },
        }
      );

      // send email from here 
  
      console.log(
        `Updated ${updateResult.modifiedCount} user profiles from premium to free (exactly 30 days old).`
      );
    } catch (error: any) {
      console.error('Error in cleaning job:', error);
    }
  };


export default cleanSubscriptions;

export const LoopPakageCleaner = () => {
    console.log('Initializing package cleaner cron job...');
    cron.schedule('0 0 * * *', async () => {
      console.log('Running subscription cleaning job at midnight...');
      await cleanSubscriptions();
    });
  };
