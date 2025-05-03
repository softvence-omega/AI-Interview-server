import express from "express";
import multer from "multer";
import { uploadResume } from "./resume.controller";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload-resume", upload.single("file"), uploadResume);

export default router;
