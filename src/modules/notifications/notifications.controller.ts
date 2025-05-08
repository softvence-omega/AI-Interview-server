import { Types } from "mongoose";
import catchAsync from "../../util/catchAsync";
import golbalRespnseHandler from "../../util/globalResponseHandeler";
import idConverter from "../../util/idConvirter";
import notificationServices from "./notifications.service";

const getAllNotifications = catchAsync(async(req, res)=>{

    const user_id = req.user.id
    const converted_user_id= idConverter(user_id)

    const result = await notificationServices.getAllNotifications(converted_user_id as Types.ObjectId)
    golbalRespnseHandler(res, {
        statusCode: 200,
        success: true,
        message: 'All users',
        data: result,
      });
})


const notificationController = {
    getAllNotifications
}


export default notificationController