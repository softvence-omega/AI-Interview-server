import { result } from "lodash";
import catchAsync from "../../util/catchAsync";
import positionServices from "./position.service";
import idConverter from "../../util/idConvirter";
import { Types } from "mongoose";

const getAllPositions = catchAsync(async (req, res) => {
    let convertedInterviewId: Types.ObjectId | undefined;
    const interviewId = req.query.interviewId as string | undefined;
  
    if (interviewId) {
      try {
        convertedInterviewId = idConverter(interviewId) as Types.ObjectId;
      } catch (error) {
        throw new Error("Invalid interview ID format");
      }
    }
  
    const result = await positionServices.getAllPositions(convertedInterviewId);
    res.status(200).json({
      status: "success",
      message: "All positions fetched successfully",
      data: result
    });
  });


const getAllInterviews =catchAsync(async(req,res)=>{
    const result = await positionServices.getAllInterviews();
    res.status(200).json({
        status: "success",
        message: "All positions fetched successfully",
        data: result, // Replace with actual data fetching logic
    });
})


const automateInterviewAndPositionCreation =catchAsync(async(req,res)=>{
    const payload = req.body
    const result = await positionServices.automateInterviewAndPositionCreation(payload);
    res.status(200).json({
        status: "success",
        message: "Automated interview and position creation successful",
        data: result, // Replace with actual data fetching logic
    });
})

const positionController = {
    getAllPositions,getAllInterviews,automateInterviewAndPositionCreation
}

export default positionController