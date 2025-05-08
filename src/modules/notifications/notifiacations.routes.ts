import express from "express";
import notificationController from "./notifications.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../constents";

const notificationRouter = express.Router()

notificationRouter.get("/getAllNotifications",auth([userRole.admin, userRole.user]),notificationController.getAllNotifications )
notificationRouter.get("/viewSpecificNotification",auth([userRole.admin, userRole.user]),notificationController.viewSpecificNotification )


export default notificationRouter