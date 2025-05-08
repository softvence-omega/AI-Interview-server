import mongoose, { ClientSession, Types } from 'mongoose';
import { TProfile, TUser } from './user.interface';
import { ProfileModel, UserModel } from './user.model';
import { uploadImgToCloudinary } from '../../util/uploadImgToCludinary';
import authUtil from '../auth/auth.utill';
import { userRole } from '../../constents';


const createUser = async (payload: Partial<TUser>, method?: string) => {
  if (payload.password !== payload.confirmPassword) {
    throw new Error("Password and confirm password do not match.");
  }

  if (!payload.aggriedToTerms) {
    throw new Error("You must agree to the terms and conditions to register.");
  }

  const existingUser = await UserModel.findOne({ email: payload.email }).select('+password');

  if (existingUser) {
    if (!existingUser.isDeleted) {
      return {
        message: "A user with this email already exists and is active.",
        data: null,
      };
    }
  }

  if(!payload.role)
  {
    payload = {...payload, role:userRole.user}
  }



  const session: ClientSession = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      let user;

      const { confirmPassword, ...rest } = payload;
      const token = await authUtil.sendOTPviaEmail(rest)

      if (method) {
        const created = await UserModel.create([rest], { session });
        user = created[0];
      } else {
        
        user = new UserModel({...rest,sentOTP:token.OTP});
        await user.save({ session });
      }

      await ProfileModel.create(
        [
          {
            name: rest.name ?? "user",
            phone: rest.phone,
            email: rest.email!,
            user_id: user._id,
          },
        ],
        { session }
      );
      
     


      return {
        message: "User created successfully.",
        data: user,
        token:token.token
      };
    });

    return result;
  } 
  catch (error) {
    console.error("Error creating user:", error);
    return {
      message: "User creation failed due to an internal error.",
      data: null,
    };
  } finally {
    session.endSession();
  }
};


const getAllUsers= async()=>{
 const result = await UserModel.find();
 return result;
}

const updateProfileData = async (user_id: Types.ObjectId, payload: Partial<TProfile>) => {
   

  try {
      const updatedProfile = await ProfileModel.findOneAndUpdate(
          { user_id },
          { $set: payload },
          { new: true }
      );
      return updatedProfile;
  } catch (error) {
      throw error;
  }
};

const deleteSingleUser = async (user_id: Types.ObjectId) => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();
  try {
      await UserModel.findOneAndUpdate({ _id: user_id }, { isDeleted: true ,email:null}, { session });
      await ProfileModel.findOneAndUpdate({ user_id }, { isDeleted: true, email:null }, { session });
      
      await session.commitTransaction();
      session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
};

const selfDistuct = async (user_id:Types.ObjectId) => {
const result = deleteSingleUser(user_id)
return result;
}

const uploadOrChangeImg = async (user_id: Types.ObjectId, imgFile: Express.Multer.File) => {
  if (!user_id || !imgFile) {
      throw new Error("User ID and image file are required.");
  }

  // Upload new image to Cloudinary
  const result = await uploadImgToCloudinary(imgFile.filename, imgFile.path);

  console.log(result);

  if (!result.secure_url) {
      throw new Error("Image upload failed.");
  }

  // Update user profile with new image URL
  const updatedUserProfile = await ProfileModel.findOneAndUpdate(
      { user_id },  // Corrected query (find by user_id, not _id)
      { img: result.secure_url },
      { new: true }
  );

  if (!updatedUserProfile) {
      throw new Error("Profile not found or update failed.");
  }

  return updatedUserProfile;
};

const getProfile = async (user_id: Types.ObjectId) => {
  const profile = await ProfileModel.findOne({ user_id }).populate([
    { path: 'user_id', model: 'UserCollection' },
    { path: 'notificationList_id', model: 'NotificationList' },
    { path: 'appliedJobs', model: 'Job' },
    { path: 'progress.interviewId', model: 'MockInterview' },
    { path: 'progress.questionBank_AndProgressTrack.questionBaank_id', model: 'QuestionBank' },
    { path: 'progress.questionBank_AndProgressTrack.lastQuestionAnswered_id', model: 'QuestionList' },
  ]);

  if (!profile) {
    throw new Error('Profile not found for the given user_id');
  }

  return profile;
};


const userServices = {
  createUser,
  getAllUsers,
  updateProfileData,
  deleteSingleUser,
  selfDistuct,
  uploadOrChangeImg,
  getProfile, 
};

export default userServices;
