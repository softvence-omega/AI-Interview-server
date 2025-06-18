// src/modules/contact/contact.controller.ts
import { Request, Response } from 'express';
import { sendContactEmail } from './contact.service';

export const contactUs = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, message } = req.body;

    if (!firstName || !lastName || !phone || !email || !message) {
      res.status(400).json({ success: false, message: "All fields are required." });
      return;
    }

    const response = await sendContactEmail({ firstName, lastName, phone, email, message });

    if (response.success) {
      res.status(200).json({ success: true, message: "Your message has been sent successfully." });
      return;
    } else {
      res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
      return;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error.", error });
    return; 
  }
};
