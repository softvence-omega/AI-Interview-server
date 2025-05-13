import { Types } from "mongoose"
import { TUserRole } from "../../constents"

export type TUser={
    name:string,
    phone:string,
    email:string,
    password:string,
    confirmPassword?:string
    aggriedToTerms:boolean,
    role:TUserRole,
    sentOTP:string,
    OTPverified:boolean  
    isDeleted?:string,
    isBlocked?:boolean,
    isLoggedIn?:boolean,
    loggedOutTime?:Date
    passwordChangeTime?:Date
}


export type eachQuestionbankProgress = {
    questionBaank_id: Types.ObjectId;
    lastQuestionAnswered_id: Types.ObjectId | null;  // ✅ Now nullable
    iscompleted: boolean;
  };
  
  export type eachInterviewProgress = {
    interviewId: Types.ObjectId;
    isCompleted: boolean;
    questionBank_AndProgressTrack: eachQuestionbankProgress[];
  };
  
  export type TProfile = {
    name: string;
    phone: string;
    email: string;
    img?: string;

    isResumeUploaded:boolean;
    resume_id:Types.ObjectId;
    isAboutMeGenerated:boolean;
    isAboutMeVideoChecked:boolean;

    experienceLevel: string;
    preferedInterviewFocus: string;
    emailNotification: boolean;
    interviewTaken: number;
    confidence: number;
    progress: eachInterviewProgress[];
    appliedJobs: Types.ObjectId[];
    user_id: Types.ObjectId;
    currentPlan: string;
    lastJobNotificationDate:Date | null,
    notificationList_id:Types.ObjectId,
    isDeleted?: boolean;
  };