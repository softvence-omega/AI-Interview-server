import express from "express"
import positionController from "./position.controller"


const positionRoues = express.Router()

positionRoues.get("/getAllPositions", positionController.getAllPositions)

export default positionRoues