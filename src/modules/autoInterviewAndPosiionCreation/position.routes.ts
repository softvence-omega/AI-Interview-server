import express from "express"
import positionController from "./position.controller"
import { upload } from "../../util/uploadImgToCludinary"
import Mock_interviewsController from "../mock_interviews/mock_interviews.controller"


const positionRoues = express.Router()

positionRoues.get("/getAllPositions", positionController.getAllPositions)
positionRoues.get("/getAllInterviews", positionController.getAllInterviews)
positionRoues.post("/automateInterviewAndPositionCreation", positionController.automateInterviewAndPositionCreation)


// bypass routes

positionRoues.post('/create_mock_interview_by_Ai',upload.single("file"),Mock_interviewsController.create_mock_interview);
positionRoues.post('/create_question_bank_by_Ai',upload.single("file"), Mock_interviewsController.create_question_bank);
positionRoues.post('/update_question_bank_by_ai',upload.single("file"), Mock_interviewsController.update_question_bank);

export default positionRoues