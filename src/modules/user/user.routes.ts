import express from "express"
import userController from "./user.controller"
import { userRole } from "../../constents"
import auth from "../../middlewares/auth"
import { upload } from "../../util/uploadImgToCludinary"
const userRoutes = express.Router()

// users roiuts
userRoutes.post("/createUser", userController.createUser);

userRoutes.patch("/updateProfileData", auth([userRole.admin, userRole.user]), userController.updateProfileData);
userRoutes.delete("/selfDistuct", auth([userRole.user]), userController.selfDistuct);

userRoutes.post("/uploadOrChangeImg", auth([userRole.admin, userRole.user]), upload.single("files"),userController.uploadOrChangeImg);
userRoutes.get("/getProfile", auth([userRole.admin, userRole.user]), userController.getProfile);

// Route to get all profiles
userRoutes.get(
  "/all-profiles",
  userController.getAllProfiles
);
// admin routes
userRoutes.get("/getAlluser", auth([userRole.admin, userRole.user]), userController.getAllUsers);
userRoutes.delete("/deleteSingleUser", auth([userRole.admin]), userController.deleteSingleUser);


// Update Profile Route (with image upload)
userRoutes.patch(
    '/updateProfile',
    auth([userRole.admin, userRole.user]), // Only authenticated users can update their profile
    upload.single('img'), // Handle single image upload
    userController.updateUserProfile // Call the controller method
  );

export default userRoutes