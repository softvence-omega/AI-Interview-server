import express from "express";
import multer from "multer";
import { deleteResume, getResumesByUser, updateResume, uploadResume } from "./resume.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../constents";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload-resume", auth([userRole.admin, userRole.user]), upload.single("file"), uploadResume);

router.get("/my-resume", auth([userRole.admin, userRole.user]), getResumesByUser);

// Update resume by ID
router.put("/update-resume/:id", updateResume);

// Delete resume by ID
router.delete("/delete-resume/:id", deleteResume);

export default router;
