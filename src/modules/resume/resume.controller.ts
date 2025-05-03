import { Request, Response } from "express";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { Resume } from "./resume.model";

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Use FormData to send file
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path), file.originalname);

    const response = await axios.post(
      "https://freepik.softvenceomega.com/in-prep/api/v1/extract-resume/extract-resume",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity, // optional if large files
      }
    );

    const resumeData = response.data;

    // Save to MongoDB
    const saved = await Resume.create(resumeData);

    // Remove uploaded file
    fs.unlinkSync(file.path);

    res.status(200).json({ message: "Resume processed", data: saved });
  } catch (error: any) {
    console.error("Upload Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};
