import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCollection',
    required: true,
  },
  name: String,
  summary: String,
  email: String,
  phone: String,
  address: Object,
  education: Array,
  experience: Array,
  technical_skills: Array,
  soft_skills: Array,
  projects: Array,
  languages: Array,
  certifications: Array,
  training: Array,
  linkedIn: String,
  github: String,
});

export const Resume = mongoose.model("Resume", resumeSchema);
