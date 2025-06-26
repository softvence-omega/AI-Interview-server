import express from "express"
import positionController from "./position.controller"


const positionRoues = express.Router()

positionRoues.get("/getAllPositions", positionController.getAllPositions)
positionRoues.get("/getAllInterviews", positionController.getAllInterviews)
positionRoues.post("/automateInterviewAndPositionCreation", positionController.automateInterviewAndPositionCreation)

export default positionRoues