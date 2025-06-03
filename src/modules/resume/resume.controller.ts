import { Request, Response } from 'express';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { isEqual } from 'lodash';
import { Resume } from './resume.model';
import { ProfileModel } from '../user/user.model';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import { genarateAboutMeService } from './resume.service';
import { Types } from 'mongoose';
import { uploadPdfToCloudinary } from '../../util/uploadImgToCludinary';
import config from '../../config';

// export const uploadResume = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const file = req.file;
//     const user_id = req.user?.id as string;

//     if (!file || !user_id) {
//       res
//         .status(400)
//         .json({ error: 'No file uploaded and need user ID for file upload!' });
//       return;
//     }

//     // Use FormData to send file
//     const formData = new FormData();
//     formData.append('file', fs.createReadStream(file.path), file.originalname);

//     const response = await axios.post(
//       'https://freepik.softvenceomega.com/in-prep/api/v1/extract-resume/extract-resume',
//       formData,
//       {
//         headers: {
//           ...formData.getHeaders(),
//         },
//         maxBodyLength: Infinity, // optional if large files
//       },
//     );

//     const resumeData = response.data;
//     resumeData.userId = user_id;

//     // Save to MongoDB
//     const saved = await Resume.create(resumeData);

//     // Remove uploaded file
//     fs.unlinkSync(file.path);

//     const updateUserProfile = await ProfileModel.findOneAndUpdate(
//       { user_id: user_id },
//       {
//         isResumeUploaded: true,
//         resume_id: saved._id,
//       },
//       { new: true },
//     );

//     res.status(200).json({ message: 'Resume processed', data: saved });
//   }
//   catch (error: any) {
//     console.error('Upload Error:', error.response?.data || error.message);
//     res.status(500).json({ error: error.response?.data || error.message });
//   }
// };

console.log('Check Check');

// export const uploadResume = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const file = req.file; // Resume file (PDF)
//     const user_id = req.user?.id as string;

//     if (!user_id) {
//       res.status(400).json({ error: 'User ID is required!' });
//     }

//     let resumeData: any = {};

//     // Case 1: Resume file uploaded (AI data extraction)
//     if (file) {
//       // Use FormData to send file to AI extraction service
//       const formData = new FormData();
//       formData.append('file', fs.createReadStream(file.path), file.originalname);

//       // Axios POST request to the AI API to extract data from the resume
//       const response = await axios.post(
//         'https://freepik.softvenceomega.com/in-prep/api/v1/extract-resume/extract-resume',
//         formData,
//         {
//           headers: {
//             ...formData.getHeaders(),
//           },
//           maxBodyLength: Infinity, // optional if large files
//         }
//       );

//       // Extracted resume data from AI
//       const aiData = response.data;
//       resumeData = { ...aiData, userId: user_id };

//       // Save extracted resume data to MongoDB
//       const savedResume = await Resume.create(resumeData);

//       // Upload the resume PDF to Cloudinary
//       // const resumePdfUpload = await uploadFileToCloudinary(file);
//       // savedResume.resumeFile = resumePdfUpload.secure_url; // Save Cloudinary URL
//       // await savedResume.save();

//       // Remove the uploaded resume file from local storage after uploading to Cloudinary
//       fs.unlinkSync(file.path);

//       // Update user profile with the saved resume
//       await ProfileModel.findOneAndUpdate(
//         { user_id: user_id },
//         {
//           isResumeUploaded: true,
//           resume_id: savedResume._id,
//         },
//         { new: true }
//       );

//       res.status(200).json({ message: 'Resume processed and saved', data: savedResume });
//     }

//     // Case 2: No resume file uploaded, allow manual profile update
//     else {
//       const manualData = JSON.parse(req.body.manualData); // Assuming manual data is passed as JSON string
//       const certificateFile = JSON.parse(req.body.certificateFile)

//       console.log('Manual Data:', manualData); // Debugging: Check the received manual data

//       // Handle certificate file upload if provided
//       let certificateFileUrl = null;
//       if (req.file && req.body.certificateName) {
//         const certificateUpload = await uploadPdfToCloudinary(certificateFile ,req.file.path);
//         certificateFileUrl = certificateUpload.secure_url; // Save certificate URL
//       }

//       // Save manual profile data in the Resume model
//       const savedResume = await Resume.create({
//         ...manualData,
//         user_id: user_id,
//         // certificateFile: certificateFileUrl, // Store certificate file URL if uploaded
//       });

//       // Debugging: Check the saved resume object
//       console.log('Saved Resume:', savedResume);

//       // Update user profile with the saved resume
//       await ProfileModel.findOneAndUpdate(
//         { user_id: user_id },
//         {
//           isResumeUploaded: true,
//           resume_id: savedResume._id,
//         },
//         { new: true }
//       );

//       res.status(200).json({ message: 'Resume created manually', data: savedResume });
//     }
//   } catch (error: any) {
//     console.error('Upload Error:', error.response?.data || error.message);
//     res.status(500).json({ error: error.response?.data || error.message });
//   }
// };

interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

export const uploadResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = req.files as MulterFiles;
    const resumeFile = files?.resumeFile?.[0]; // Resume file
    const certificateFile = files?.certificateFile?.[0]; // Certificate file
    const user_id = req.user?.id as string;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Check if resume exists
    const existingResume = await Resume.findOne({ user_id });

    // Case 1: Resume file uploaded (AI data extraction)
    if (resumeFile) {
      const formData = new FormData();
      formData.append(
        'file',
        fs.createReadStream(resumeFile.path),
        resumeFile.originalname,
      );

      const response = await axios.post(
        `${config.AI_BASE_URL}/extract-resume/extract-resume`,
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
        },
      );

      const aiData = response.data;

      let updatedResume;
      if (existingResume) {
        // Update existing resume
        updatedResume = await Resume.findOneAndUpdate(
          { user_id },
          { $set: { ...aiData, user_id } },
          { new: true },
        );
      } else {
        // Create new resume
        updatedResume = await Resume.create({ ...aiData, user_id });
      }

      // Clean up resume file
      await fs.promises.unlink(resumeFile.path).catch((err) => {
        console.error(`Error deleting resume file: ${err.message}`);
      });

      const convertedUserId = idConverter(user_id);

      console.log('converted user id:::', convertedUserId);

      await genarateAboutMeService(convertedUserId as Types.ObjectId);

      // Update user profile
      await ProfileModel.findOneAndUpdate(
        { user_id },
        { isResumeUploaded: true, resume_id: updatedResume!._id },
        { new: true, upsert: true }, // Create profile if it doesn't exist
      );

      console.log('User id :::', user_id);

      // Fetch updated profile for response
      const generateAboutMeData = await ProfileModel.findOne({ user_id });

      console.log('About me ::: ', generateAboutMeData);

      res.status(200).json({
        message: 'Resume uploaded successfully',
        data: updatedResume,
        profile: generateAboutMeData
          ? {
              isAboutMeGenerated: generateAboutMeData.isAboutMeGenerated,
              generatedAboutMe: generateAboutMeData.generatedAboutMe,
            }
          : null,
      });
      return;
    }

    // Case 2: Manual data or certificate upload
    if (req.body.manualData || certificateFile) {
      let manualData: any = {};
      if (req.body.manualData) {
        try {
          manualData = JSON.parse(req.body.manualData);
        } catch (error) {
          res.status(400).json({ error: 'Invalid manual data format' });
          return;
        }
      }

      let certificateFileUrl: string | null = null;
      if (certificateFile) {
        const certificateUpload = await uploadPdfToCloudinary(
          certificateFile.originalname,
          certificateFile.path,
        );
        certificateFileUrl = certificateUpload.secure_url;

        // Clean up certificate file
        await fs.promises.unlink(certificateFile.path).catch((err) => {
          console.error(`Error deleting certificate file: ${err.message}`);
        });
      }

      let updatedResume;
      if (existingResume) {
        // Prepare update data
        const updateData: any = { $set: { ...manualData, user_id } };

        // Replace certifications array
        if (certificateFileUrl) {
          updateData.$set.certifications = [
            {
              certificateName: req.body.certificateName || 'Certificate',
              certificateFile: certificateFileUrl,
            },
          ];
        } else if (manualData.certifications) {
          updateData.$set.certifications = manualData.certifications;
        }

        // Update existing resume
        updatedResume = await Resume.findOneAndUpdate({ user_id }, updateData, {
          new: true,
        });
      } else {
        // Create new resume with manual data
        const resumeData = {
          ...manualData,
          user_id,
          certifications: certificateFileUrl
            ? [
                {
                  certificateName: req.body.certificateName || 'Certificate',
                  certificateFile: certificateFileUrl,
                },
              ]
            : manualData.certifications || [],
        };
        updatedResume = await Resume.create(resumeData);
      }

      // Update user profile
      await ProfileModel.findOneAndUpdate(
        { user_id },
        { isResumeUploaded: true, resume_id: updatedResume!._id },
        { new: true, upsert: true }, // Create profile if it doesn't exist
      );

      res
        .status(200)
        .json({ message: 'Resume updated manually', data: updatedResume });
      return;
    }

    res
      .status(400)
      .json({ error: 'No resume file, certificate, or manual data provided' });
  } catch (error: any) {
    console.error('Upload Error:', error.message);
    // Clean up files only if they exist
    const files = req.files as MulterFiles;
    if (files?.resumeFile?.[0]) {
      await fs.promises.unlink(files.resumeFile[0].path).catch((err) => {
        console.error(`Error deleting resume file: ${err.message}`);
      });
    }
    if (files?.certificateFile?.[0]) {
      await fs.promises.unlink(files.certificateFile[0].path).catch((err) => {
        console.error(`Error deleting certificate file: ${err.message}`);
      });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
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

// export const updateResume = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     const updatedResume = await Resume.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedResume) {
//       res.status(404).json({ error: 'Resume not found' });
//       return;
//     }

//     res.status(200).json({ message: 'Resume updated', data: updatedResume });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const updateResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const updateData = req.body;

    const currentResume = await Resume.findOne({ user_id: userId });
    if (!currentResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // const currentEducation: any[] = currentResume.education || [];
    // const updatedEducation: any[] = updateData.education || [];

    // let educationChanged = false;

    // if (currentEducation.length !== updatedEducation.length) {
    //   educationChanged = true;
    // } else {
    //   for (let i = 0; i < currentEducation.length; i++) {
    //     const current = currentEducation[i];
    //     const updated = updatedEducation[i];

    //     if (
    //       current.institution !== updated.institution ||
    //       current.degree !== updated.degree ||
    //       current.majorField !== updated.majorField ||
    //       current.startDate !== updated.startDate ||
    //       current.completionDate !== updated.completionDate
    //     ) {
    //       educationChanged = true;
    //       break;
    //     }
    //   }
    // }

    let educationChanged = false;

    if ('education' in updateData) {
      const currentEducation: any[] = currentResume.education || [];
      const updatedEducation: any[] = updateData.education || [];

      if (currentEducation.length !== updatedEducation.length) {
        educationChanged = true;
      } else {
        for (let i = 0; i < currentEducation.length; i++) {
          const current = currentEducation[i];
          const updated = updatedEducation[i];

          if (
            current.institution !== updated.institution ||
            current.degree !== updated.degree ||
            current.majorField !== updated.majorField ||
            current.startDate !== updated.startDate ||
            current.completionDate !== updated.completionDate
          ) {
            educationChanged = true;
            break;
          }
        }
      }
    }

    // ✅ Use resume ID here
    const updatedResume = await Resume.findByIdAndUpdate(
      currentResume.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedResume) {
      res.status(404).json({ error: 'Resume not found after update' });
      return;
    }

    const userIdConverted = idConverter(userId);

    // Regenerate About Me if education changed
    if (educationChanged) {
      await genarateAboutMeService(userIdConverted as Types.ObjectId);

      // Update profile if either education change
      if (educationChanged) {
        await ProfileModel.findOneAndUpdate(
          { user_id: userIdConverted },
          { isResumeUploaded: true },
          { new: true },
        );
      }

      // Set isAboutMeGenerated = true in profile
      await ProfileModel.findOneAndUpdate(
        { user_id: userIdConverted },
        { isAboutMeGenerated: true },
        { new: true },
      );
    }

    // Fetch profile (always)
    const userProfile = await ProfileModel.findOne({
      user_id: userIdConverted,
    });

    const aboutMeData = userProfile
      ? {
          isAboutMeGenerated: userProfile.isAboutMeGenerated,
          generatedAboutMe: userProfile.generatedAboutMe,
        }
      : null;

    res.status(200).json({
      message: 'Resume updated',
      data: updatedResume,
      aboutMe: aboutMeData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // const { id } = req.params;
    const user_id = req.user?.id as string;

    const deletedResume = await Resume.findByIdAndDelete(user_id);

    if (!deletedResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.status(200).json({ message: 'Resume deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const genarateAboutMe = catchAsync(async (req, res) => {
  console.log('Calllleeeddddd');
  const user_id = req.user.id as string;
  const convirtedUserId = idConverter(user_id);
  const result = genarateAboutMeService(convirtedUserId as Types.ObjectId);

  res.status(200).json({ message: 'About me genartated', data: result });
});
