import { NextFunction, Request, Response } from 'express';
import idConverter from '../util/idConvirter';
import { ProfileModel } from '../modules/user/user.model';
import catchAsync from '../util/catchAsync';


const purchasePlanGuard = () => {
    return catchAsync(async (req:Request, res: Response, next: NextFunction) => {
      // Validate user ID
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('Unauthorized: User not authenticated'); // Stops execution, no next()
      }
  
      // Convert userId to ObjectId
      let User_id
      try {
        User_id = idConverter(userId);
      } catch (error) {
        throw new Error('Invalid user ID format'); // Stops execution, no next()
      }
  
      // Query user profile
      const findProfileOfUser = await ProfileModel.findOne({
        user_id: User_id,
      })
        .select('currentPlan interviewsAvailable')
        .lean();
  
      // Throw error if no profile is found
      if (!findProfileOfUser) {
        throw new Error('No profile found'); // Stops execution, no next()
      }

      console.log("i am being called")

      console.log(findProfileOfUser)
  
      // Check if user has a Premium plan with interviews available
      if (findProfileOfUser.currentPlan === 'Premium' && findProfileOfUser.interviewsAvailable > 0) {
        throw new Error('You have interviews left. Please use them first.'); // Stops execution, no next()
      }
  
      // Only call next() if all checks pass (no errors thrown)
      next();
    });
  };

export default purchasePlanGuard;
