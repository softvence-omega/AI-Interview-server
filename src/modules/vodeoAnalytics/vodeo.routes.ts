import express from "express";
import videoAnalysisController from "./video.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../constents";

const videoRoutes = express.Router()

videoRoutes.post("/submit_Video_Analysis_and_Summary",auth([userRole.admin, userRole.user]), videoAnalysisController.submitVideoAnalysisAndAummary )
videoRoutes.get("/getSummary",auth([userRole.admin, userRole.user]), videoAnalysisController.getSummary)


export default videoRoutes;