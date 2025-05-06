import catchAsync from "../../util/catchAsync";
import vidoAnalysisServices from "./video.service";

const submitVideoAnalysisAndAummary = catchAsync(async(req,res)=>{
const payLoad = req.body

const result = await vidoAnalysisServices.submitVideoAnalysisAndAummary(payLoad)

res.status(200).json({
    success: true,
    message: "Video Analysis submitted successfully",
    data: result
})
})

const videoAnalysisController = {
    submitVideoAnalysisAndAummary
}
export default videoAnalysisController