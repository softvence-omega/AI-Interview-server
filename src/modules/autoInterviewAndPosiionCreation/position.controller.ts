import { result } from "lodash";
import catchAsync from "../../util/catchAsync";
import positionServices from "./position.service";

const getAllPositions =catchAsync(async(req,res)=>{
    const result = await positionServices.getAllPositions();
    res.status(200).json({
        status: "success",
        message: "All positions fetched successfully",
        data: result, // Replace with actual data fetching logic
    });
})

const positionController = {
    getAllPositions
}

export default positionController