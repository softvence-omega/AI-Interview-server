import axios from 'axios';
import FormData from 'form-data';
import { config2 } from '../../config';
import { Types } from 'mongoose';
import { Resume } from './resume.model';
import { ProfileModel } from '../user/user.model';

export async function extractResume(file: Express.Multer.File): Promise<any> {
  try {
    // Prepare form data for AI API
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    // Call AI API without authentication
    const response = await axios.post(config2.aiApiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to process resume: ${(error as Error).message}`);
  }
}



export const genarateAboutMeService = async (userId: Types.ObjectId) => {
  try {
    const resume = await Resume.findOne({ user_id:userId });

    if (!resume) {
      console.warn("No resume found for user:", userId.toString());
      return null;
    }

    console.log("Sending resume to AI API...");

    let response;
    try {
      response = await axios.post(
        "https://freepik.softvenceomega.com/in-prep/api/v1/about_me/about-me",
        resume,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10s timeout
        }
      );
    } catch (apiError: any) {
      const status = apiError?.response?.status;
      const errorMsg = apiError?.response?.data || apiError.message;

      console.error(
        `AI API error (status: ${status}):`,
        JSON.stringify(errorMsg)
      );

      return null; // don't throw — just log and return null
    }

    const aboutMeText = response?.data;

    if (!aboutMeText || typeof aboutMeText !== "string") {
      console.warn("Invalid response format from AI API:", response?.data);
      return null;
    }

    await ProfileModel.updateOne(
      { user_id: userId },
      {
        $set: {
          isAboutMeGenerated: true,
          generatedAboutMe: aboutMeText,
        },
      }
    );

    console.log("About Me section generated and saved successfully.");
    return aboutMeText;
  } catch (error: any) {
    console.error("Unexpected error in genarateAboutMeService:", error.message);
    return null;
  }
};


