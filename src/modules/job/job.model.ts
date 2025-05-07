import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  link: { type: String, unique: true },
  posted: Date,
  category: String,
  source: String,
  description: String,
  requirements: String,
  whatWeOffer: String,
  jobSummary: String,
  responsibilities: String,
  howToApply: String,
  applicationDeadline: Date,
}, { timestamps: true });

export const Job = mongoose.model('Job', JobSchema);
