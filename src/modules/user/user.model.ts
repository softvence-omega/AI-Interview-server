import bcrypt from 'bcrypt';
import mongoose, { Schema, model } from 'mongoose';
import { TProfile, TUser } from './user.interface';
import { userRole } from '../../constents';
import { date } from 'zod';

const UserSchema = new Schema<TUser>(
  {
    name: { type: String, required: false, default: 'user' },
    phone: { type: String, required: false, unique: false },
    email: { type: String, required: false, unique: false },
    password: { type: String, required: false },
    confirmPassword: { type: String, required: false },
    role: { type: String, enum: ['admin', 'user'], default: userRole.user },
    aggriedToTerms: { type: Boolean, required:false, default: false },
    allowPasswordChange:{ type: Boolean, default: false },
    sentOTP: { type: String, required: false, unique: false, default: null },
    OTPverified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    loggedOutTime: { type: Date },
    passwordChangeTime: { type: Date },
    fcmToken:{type:String,required:false, default:null}
  },
  { timestamps: true },
);

const QuestionBankProgressSchema = new Schema({
  questionBaank_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'QuestionBank',
  },
  lastQuestionAnswered_id: {
    type: Schema.Types.ObjectId,
    required: false,
    default: null,
    ref: 'QuestionList',
  },
  iscompleted: {
    type: Boolean,
    default: false,
  },
});

const InterviewProgressSchema = new Schema({
  interviewId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'MockInterview',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  questionBank_AndProgressTrack: {
    type: [QuestionBankProgressSchema],
    default: [],
  },
});

const ProfileSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: false },
    email: { type: String, required: false, unique: false },
    img: { type: String, default: "https://res.cloudinary.com/dpgcpei5u/image/upload/v1747546759/interviewProfile_jvo9jl.jpg" },

    experienceLevel: { type: String, default: null },
    preferedInterviewFocus: { type: String, default: null },
    emailNotification: { type: Boolean, default: false },
    interviewTaken: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },

    isResumeUploaded: { type: Boolean, default: false },
    resume_id: { type: Schema.Types.ObjectId, required: false, ref: 'Resume' },
    isAboutMeGenerated:{ type: Boolean, default: false },
    generatedAboutMe:{ type: String, default: null },
    isAboutMeVideoChecked: { type: Boolean, default: false },

    progress: { type: [InterviewProgressSchema], default: [] },
    appliedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    seenJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserCollection',
    },
    currentPlan: { type: String, default: 'free' },
    plan_id: [{
      type: Schema.Types.ObjectId,
      ref: 'Plan'
    }],

    interviewsAvailable: { type: Schema.Types.Mixed, default: 1 },
    jobsAvailable: { type: Schema.Types.Mixed, default: 10 },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: [{ type: String, default: null }],
    paymentId: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],


    lastJobNotificationDate: { type: Date, default: null },
    notificationList_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'NotificationList',
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Hash only if password is modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    return next(error);
  }
});

export const UserModel = mongoose.model('UserCollection', UserSchema);
export const ProfileModel =  mongoose.model('Profile', ProfileSchema);
