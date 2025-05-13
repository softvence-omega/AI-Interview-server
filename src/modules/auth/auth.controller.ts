import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import authServices from './auth.services';


const logIn = catchAsync(async (req, res) => {
  const { email, password,method } = req.body;
  const result = await authServices.logIn(email, password,method,);
  const { approvalToken, refreshToken, updatedUser,message,meta } = result;

  res.status(200).json({
    message: 'Log In Successful',
    access_Message:message,
    approvalToken: approvalToken,
    refreshToken: refreshToken,
    meta:meta,
    user: updatedUser,
    
  });
});

const logOut = catchAsync(async (req, res) => {
  const userId = req?.user.id;

  if (!userId) {
    throw Error('token is missing');
  }

  const result = await authServices.logOut(userId);
  res.status(200).json({
    message: 'Log OUT Successful',
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const authorizationToken = req.headers?.authorization as string;

  const result = await authServices.changePassword(
    authorizationToken,
    oldPassword,
    newPassword,
  );
  res.status(200).json({
    success: true,
    message: 'password changed',
    body: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'log token refreshed',
    body: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {

  const email = req.body?.email;
  const result = await authServices.forgetPassword(email);
  res.status(200).json({
    success: true,
    message: 'reset password token genarated check your email',
    body: result,
  });

});

const resetPassword = catchAsync(async (req, res) => {
  const { id, newPassword } = req.body;
  const authorizationToken = req.headers?.authorization as string;
  // console.log(req.body)

  const result = await authServices.resetPassword(
    authorizationToken,
    id,
    newPassword,
  );

  res.status(200).json({
    success: true,
    message: 'password changed',
    body: result,
  });
});

const collectProfileData = catchAsync(async (req, res) => {
  const user = req.user 
  const result = await authServices.collectProfileData(user.id);
  res.status(200).json({
    success: true,
    message: 'password changed',
    body: result,
  });
});

const otpcrossCheck = catchAsync(async (req, res) =>{

  const token = req.body.token as string
  const recivedOTP = req.body.recivedOTP as string

  console.log("yoo yooo",recivedOTP)



  const result = await authServices.otpcrossCheck(token,recivedOTP)
  res.status(200).json({
    success: true,
    message: 'OTP verified successfully,allowed to log in',
    body: result.user,
  });
})

const send_OTP = catchAsync(async(req, res) =>{
const user_id = req.user.id as string
const converted_id = idConverter(user_id)

const result =await authServices.send_OTP(converted_id as Types.ObjectId)
res.status(200).json({
  success: true,
  message: 'OTP verified successfully,allow to log in',
  body: result,
});

})

const authController = {
  logIn,
  otpcrossCheck,
  logOut,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  collectProfileData,
  send_OTP
};
export default authController;
