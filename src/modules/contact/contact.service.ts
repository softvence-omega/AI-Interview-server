import { generateEmailTemplate } from "../../util/emailTemplate";
import { sendEmail } from "../../util/sendEmail";

interface ContactData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
}

export const sendContactEmail = async (data: ContactData) => {
  const { firstName, lastName, phone, email, message } = data;

  const emailHtml = generateEmailTemplate({
    title: `📩 New Contact Message from ${firstName} ${lastName}`,
    message: `
      <strong>Name:</strong> ${firstName} ${lastName}<br />
      <strong>Email:</strong> ${email}<br />
      <strong>Phone:</strong> ${phone}<br /><br />
      <strong>Message:</strong><br />
      ${message}
    `,
    ctaText: "Reply to User",
    ctaLink: `mailto:${email}`,
    footer: `This message was sent from the Contact Us form.`,
  });

  // Change this admin email to your own
//   const adminEmail = process.env.COMPANY_GMAIL;

  const response = await sendEmail(`${process.env.COMPANY_GMAIL}`, `Contact Request from ${firstName} ${lastName}`, emailHtml);

  return response;
};
