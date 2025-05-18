import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserCollection",
    required: true,
    unique: true
  },
  name: String,
  summary: String,
  email: String,
  phone: String,
  address: Object,
  linkedIn: String,
  github: String,
  technicalSkills: [String],
  softSkills: [String],
  projects: [Object],
  education: [Object],
  awards: [String],
  experience: [Object],
  languages: [Object],
  certifications: [{
    certificateName: String,
    certificateFile: String,
  }],
  training: [String],
});

resumeSchema.index({ user_id: 1 }, { unique: true });

export const Resume = mongoose.model("Resume", resumeSchema);