// src/cron/unfinishedInterviewReminder.job.ts
import cron from 'node-cron';
import { ProfileModel } from '../user/user.model';
import { MockInterviewModel } from '../mock_interviews/mock_interviews.model';
import { NotificationListModel, NotificationModel } from './notifications.model';



export const unfinishedInterviewHandler = async () => {
  console.log('⏰ Running scheduled interview reminder');

  const usersProfiles = await ProfileModel.find({
    progress: { $elemMatch: { isCompleted: false } },
  });

  for (const profile of usersProfiles) {
    const incompleteInterviews = profile.progress.filter(
      (entry) => entry.isCompleted === false
    );

    if (incompleteInterviews.length > 0) {
      console.log(`User: ${profile.user_id} has unfinished interviews:`);

      for (const interview of incompleteInterviews) {
        const interviewInfo = await MockInterviewModel.findById(interview.interviewId).select('interview_name');

        if (!interviewInfo) continue;

        const notificationMessage = `Reminder: You have not completed the "${interviewInfo.interview_name}" mock interview. Continue your preparation today!`;

        // 1. Upsert NotificationList
        const notificationList = await NotificationListModel.findOneAndUpdate(
          { user_id: profile.user_id },
          {
            $setOnInsert: {
              user_id: profile.user_id,
              Profile_id: profile._id,
              oldNotificationCount: 0,
              seenNotificationCount: 0,
              newNotification: 0,
              notificationList: [],
            },
          },
          { new: true, upsert: true }
        );

        // 2. Create individual notification
        const eachNotification = await NotificationModel.create({
          user_id: profile.user_id,
          Profile_id: profile._id,
          notificationType: 'interview_Progress',
          notificationDetail: notificationMessage,
          isSeen: false,
        });

        // 3. Update the NotificationList
        await NotificationListModel.updateOne(
          { user_id: profile.user_id },
          {
            $inc: {
              oldNotificationCount: 1,
              newNotification: 1,
            },
            $push: {
              notificationList: eachNotification._id,
            },
          }
        );

        //send email from here

        console.log(`🔔 Notification sent for "${interviewInfo.interview_name}" to user ${profile.user_id}`);
      }
    }
  }
};


const jobNotificationHandler = async () => {
  console.log('🔎 Checking who needs job notifications');

  const today = new Date();

  const users = await ProfileModel.find({});

  for (const user of users) {
    const { currentPlan, lastJobNotificationDate } = user;
    let intervalDays = 0;

    if (currentPlan === 'free') intervalDays = 30;
    else if (currentPlan === 'premium') intervalDays = 7;
    else continue; // Skip users with unknown or invalid plans

    const lastNotified = new Date(lastJobNotificationDate || 0);
    const diff = (today.getTime() - lastNotified.getTime()) / (1000 * 3600 * 24);

    if (diff >= intervalDays) {
      const message = `🎯 New job opportunities await you! Visit the app and apply today.`;

      const notification = await NotificationModel.create({
        user_id: user.user_id,
        Profile_id: user._id,
        notificationType: 'latest_job',
        notificationDetail: message,
        isSeen: false,
      });

      await NotificationListModel.findOneAndUpdate(
        { user_id: user.user_id },
        {
          $inc: { oldNotificationCount: 1, newNotification: 1 },
          $push: { notificationList: notification._id },
          $setOnInsert: {
            Profile_id: user._id,
            seenNotificationCount: 0,
          },
        },
        { upsert: true, new: true }
      );

      await ProfileModel.updateOne(
        { _id: user._id },
        { $set: { lastJobNotificationDate: today } }
      );


      //send email from here

      console.log(`📨 Job notification sent to ${user.user_id}`);
    }
  }
};



const upgradePlanReminderHandler = async () => {
  console.log('💡 Sending upgrade reminders...');

  const users = await ProfileModel.find({});

  for (const user of users) {
    // Skip users with the "premium" plan
    if (user.currentPlan === 'premium') {
      console.log(`✅ Skipping upgrade reminder for ${user.user_id} (Premium plan)`);
      continue;
    }

    const message = `Your current plan may limit your growth. Consider upgrading to get more features!`;

    const notification = await NotificationModel.create({
      user_id: user.user_id,
      Profile_id: user._id,
      notificationType: 'upgrade_plan',
      notificationDetail: message,
      isSeen: false,
    });

    await NotificationListModel.updateOne(
      { user_id: user.user_id },
      {
        $inc: { oldNotificationCount: 1, newNotification: 1 },
        $push: { notificationList: notification._id },
      },
      { upsert: true }
    );

    //send email from here

    console.log(`⚠️ Upgrade reminder sent to ${user.user_id}`);
  }
};




const startNotificationSchedulers = () => {
  // Every 3 days at 10:00 AM
  cron.schedule('0 10 */3 * *', async () => {
    await unfinishedInterviewHandler();
  });

  // Every day at 11:00 AM — check which users need a job notification (based on their plan)
  cron.schedule('0 11 * * *', async () => {
    await jobNotificationHandler();
  });

  // Every 30 days at 12:00 PM
  cron.schedule('0 12 */30 * *', async () => {
    await upgradePlanReminderHandler();
  });
};

startNotificationSchedulers()

export default startNotificationSchedulers;
