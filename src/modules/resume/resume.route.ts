import express from "express";
import multer from "multer";
import { deleteResume, getResumesByUser, updateResume, uploadResume,genarateAboutMe } from "./resume.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../constents";
import { uploadPdf } from "../../util/uploadImgToCludinary";

const resumeRoutes = express.Router();

const upload = multer({ dest: "uploads/" });

resumeRoutes.post("/upload-resume", 
    auth([userRole.admin, userRole.user]), 
    // upload.single("file"), 
    uploadPdf.fields([
        { name: "resumeFile", maxCount: 1 },
        { name: "certificateFile", maxCount: 1 },
      ]),
    uploadResume);

resumeRoutes.get("/my-resume", auth([userRole.admin, userRole.user]), getResumesByUser);

// Update resume by ID
resumeRoutes.put("/update-resume", auth([userRole.admin, userRole.user]), updateResume);

// Delete resume by ID
resumeRoutes.delete("/delete-resume", auth([userRole.admin, userRole.user]), deleteResume);

resumeRoutes.post("/genarateAboutMe", auth([userRole.admin, userRole.user]), genarateAboutMe )

export default resumeRoutes;





// "data": {
//     "userId": "6822e2a8897cd3b00d7e57fd",
//     "name": "O L I VOI A W W I L S O N",
//     "summary": "Experienced and results-driven Marketing Manager with a proven track record in developing and executing successful marketing strategies. Seeking a challenging role contributing skills in strategic planning, team leadership, and creative problem-solving to achieve business objectives.",
//     "email": "hello@reallygreatsite.com",
//     "phone": "+123-456-7890",
//     "address": {
//         "street": "123 Anywhere St.",
//         "city": "Any City",
//         "state": null,
//         "postal_code": null,
//         "country": null
//     },
//     "education": [
//         {
//             "degree": "Master of Business Management",
//             "institution": "Borcelle University",
//             "major_field": null,
//             "education_level": "Postgraduate",
//             "start_date": "2029",
//             "completion_date": "2030",
//             "gpa": null,
//             "gpa_scale": null
//         },
//         {
//             "degree": "Bachelor of Business Management",
//             "institution": "Borcelle University",
//             "major_field": null,
//             "education_level": "Undergraduate",
//             "start_date": "2025",
//             "completion_date": "2029",
//             "gpa": "3.8",
//             "gpa_scale": "4.0"
//         }
//     ],
//     "experience": [
//         {
//             "job_title": "Marketing Manager & Specialist",
//             "company": "Borcelle Studio",
//             "duration": "2030 - PRESENT",
//             "responsibilities": [
//                 "Led the development and implementation of comprehensive marketing strategies",
//                 "Successfully launched and managed multiple cross-channel campaigns"
//             ],
//             "skills": [
//                 "Marketing Management",
//                 "Cross-Channel Marketing"
//             ],
//             "start_date": "2030",
//             "end_date": null
//         },
//         {
//             "job_title": "Marketing Manager & Specialist",
//             "company": "Fauget Studio",
//             "duration": "2025 - 2029",
//             "responsibilities": [
//                 "Conducted market research",
//                 "Oversaw the creation of engaging content"
//             ],
//             "skills": [
//                 "Market Research",
//                 "Content Creation"
//             ],
//             "start_date": "2025",
//             "end_date": "2029"
//         },
//         {
//             "job_title": "Marketing Manager & Specialist",
//             "company": "Studio Shodwe",
//             "duration": "2024 - 2025",
//             "responsibilities": [
//                 "Developed and executed targeted marketing campaigns",
//                 "Implemented SEO strategies",
//                 "Collaborated with sales teams"
//             ],
//             "skills": [
//                 "Marketing Campaign Development",
//                 "SEO",
//                 "Sales Collaboration"
//             ],
//             "start_date": "2024",
//             "end_date": "2025"
//         }
//     ],
//     "technical_skills": [
//         "Project Management",
//         "Public Relations",
//         "Time Management",
//         "Leadership",
//         "Effective Communication",
//         "Critical Thinking"
//     ],
//     "soft_skills": [],
//     "projects": [],
//     "languages": [
//         {
//             "name": "English",
//             "proficiency": "Fluent"
//         },
//         {
//             "name": "French",
//             "proficiency": "Fluent"
//         },
//         {
//             "name": "German",
//             "proficiency": "Basics"
//         },
//         {
//             "name": "Spanish",
//             "proficiency": "Intermediate"
//         }
//     ],
//     "certifications": [],
//     "training": [],
//     "linkedIn": "www.reallygreatsite.com",
//     "_id": "6822ec2a5c2e99fb31be68dd",
//     "__v": 0
// }
