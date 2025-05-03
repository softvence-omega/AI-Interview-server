import axios from 'axios';
import FormData from 'form-data';
import { config2 } from '../../config';

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