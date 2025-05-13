import { Request, Response } from 'express';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { Resume } from './resume.model';
import { ProfileModel } from '../user/user.model';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import { genarateAboutMeService } from './resume.service';
import { Types } from 'mongoose';

export const uploadResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const file = req.file;
    const user_id = req.user?.id as string;

    if (!file || !user_id) {
      res
        .status(400)
        .json({ error: 'No file uploaded and need user ID for file upload!' });
      return;
    }

    // Use FormData to send file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    const response = await axios.post(
      'https://freepik.softvenceomega.com/in-prep/api/v1/extract-resume/extract-resume',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity, // optional if large files
      },
    );

    const resumeData = response.data;
    resumeData.userId = user_id;

    // Save to MongoDB
    const saved = await Resume.create(resumeData);

    // Remove uploaded file
    fs.unlinkSync(file.path);

    const updateUserProfile = await ProfileModel.findOneAndUpdate(
      { user_id: user_id },
      {
        isResumeUploaded: true,
        resume_id: saved._id,
      },
      { new: true },
    );

    res.status(200).json({ message: 'Resume processed', data: saved });
  }
  catch (error: any) {
    console.error('Upload Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

export const getResumesByUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: No user ID found' });
      return;
    }

    const resumes = await Resume.find({ userId });

    res.status(200).json(resumes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedResume = await Resume.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.status(200).json({ message: 'Resume updated', data: updatedResume });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedResume = await Resume.findByIdAndDelete(id);

    if (!deletedResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.status(200).json({ message: 'Resume deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const genarateAboutMe =catchAsync(async(req, res)=>{
const user_id = req.user.id as string
const convirtedUserId= idConverter(user_id)
const result =  genarateAboutMeService(convirtedUserId as Types.ObjectId)

res.status(200).json({ message: 'About me genartated',data:result });

})
