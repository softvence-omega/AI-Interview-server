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

export type TProfile={
    name:string,
    phone:string,
    email:string,

    img?:string,

    experienceLevel:string,
    preferedInterviewFocus:string,
    emailNotification:boolean,
    interviewTaken:number,
    confidence:number,
    progress: [
        {
            interviewId:Types.ObjectId,
            isCompleted:boolean,
            questionBank:number,
        }
    ],

    appliedJobs: Types.ObjectId[];

    user_id:Types.ObjectId,
    currentPlan: string,

    isDeleted?:boolean,
}
