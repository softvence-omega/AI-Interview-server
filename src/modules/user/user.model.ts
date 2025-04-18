import bcrypt from "bcrypt"
import mongoose, { Schema, model } from 'mongoose';
import { TProfile, TUser } from "./user.interface";
import { userRole } from "../../constents";


const UserSchema = new Schema<TUser>({
    name: { type: String, required: false, default: "user" },
    phone: { type: String, required: true, unique: false},
    email: { type: String, required: true, unique: false},
    password: { type: String, required: false },
    confirmPassword: { type: String, required: false },
    role: { type: String, enum: ["admin" , "user"], default:userRole.user },
    aggriedToTerms:{type:Boolean, default:false},
    sentOTP:{ type: String, required: false, unique: false, default:null},
    OTPverified:{ type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    loggedOutTime: { type: Date },
    passwordChangeTime: { type: Date }
}, { timestamps: true });

const ProfileSchema = new Schema<TProfile>({
    name: { type: String, required: false, default: "user" },
    phone: { type: String, required: false, unique: false },
    email: { type: String, required: false, unique: false },
    
    img: { type: String, default: null },
    
    experienceLevel: { type: String, default: null },
    preferedInterviewFocus: { type: String, default: null },
    emailNotification: { type: Boolean, default: false },
    interviewTaken: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },

    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });


UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Hash only if password is modified

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        return next(error);
    }
});


export const UserModel = mongoose.model("UserCollection", UserSchema);
export const ProfileModel = model('Profile', ProfileSchema);





