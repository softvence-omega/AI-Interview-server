import { Types } from "mongoose";
import { NotificationListModel, NotificationModel } from "./notifications.model";

const getAllNotifications = async (user_id: Types.ObjectId) => {
    // Atomically update the notification counts and retrieve the updated document
    const updatedNotificationList = await NotificationListModel.findOneAndUpdate(
      { user_id: user_id },
      [
        {
          $set: {
            seenNotificationCount: { $add: ["$seenNotificationCount", "$newNotification"] },
            newNotification: 0,
          },
        },
      ],
      {
        new: true, // Return the updated document
      }
    ).populate({
      path: "notificationList",
      options: { sort: { createdAt: -1 } }, // Sort notifications by createdAt descending
    });
  
    return updatedNotificationList;
  };



  const viewSpecificNotification = async (notification_id: Types.ObjectId, user_id: Types.ObjectId) => {
    try {
      const updatedNotification = await NotificationModel.findOneAndUpdate(
        {_id:notification_id,user_id:user_id},
        { $set: { isSeen: true } },
        { new: true }
      );
  
      return updatedNotification;
    } 
    catch (error) 
    {
      console.error('Error updating notification:', error);
      throw error;
    }
  };

const notificationServices={
    getAllNotifications,viewSpecificNotification
}

export default notificationServices