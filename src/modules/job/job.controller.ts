import { Request, Response } from 'express';
import { Job } from './job.model';
import { ProfileModel } from '../user/user.model';
import mongoose from 'mongoose';

const getJobs = async (req: Request, res: Response) => {
    try {
      const { title, company, location, year, status } = req.query;
      const userId = (req as any).user?.id; // from auth middleware
  
      const query: any = {};
  
      if (title) {
        query.title = { $regex: new RegExp(title as string, "i") };
      }
  
      if (company) {
        query.company = { $regex: new RegExp(company as string, "i") };
      }
  
      if (location) {
        query.location = { $regex: new RegExp(location as string, "i") };
      }
  
      if (year) {
        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${+year + 1}-01-01`);
        query.posted = { $gte: yearStart, $lt: yearEnd };
      }
  
      // Get jobs based on filters first
      const jobs = await Job.find(query).sort({ posted: -1 });
  
      // If filtering by "status", load user profile and filter accordingly
      if (status && userId) {
        const profile = await ProfileModel.findOne({ user_id: userId });
  
        if (!profile) {
          res.status(404).json({ message: "User profile not found" });
          return;
        }
  
        const appliedJobIds = new Set(profile.appliedJobs.map(jobId => jobId.toString()));
  
        const filteredJobs =
          status === "applied"
            ? jobs.filter(job => appliedJobIds.has(job._id.toString()))
            : status === "not_applied"
            ? jobs.filter(job => !appliedJobIds.has(job._id.toString()))
            : jobs;
  
        console.log(`[GET /jobs] Filtered by status=${status}, Found: ${filteredJobs.length}`);
        res.json(filteredJobs);
        return;
      }
  
      console.log(`[GET /jobs] Found: ${jobs.length}`);
      res.json(jobs);
    } catch (error) {
      console.error("[GET /jobs] Error:", error);
      res.status(500).json({ message: "Failed to fetch jobs", error });
    }
  };

const markJobAsApplied = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const jobId = req.params.id;

  try {
    const profile = await ProfileModel.findOne({ user_id: userId });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const jobObjectId = new mongoose.Types.ObjectId(jobId);

    const alreadyApplied = profile.appliedJobs?.some(
      (id) => id.toString() === jobObjectId.toString(),
    );
    if (alreadyApplied) {
      res.status(400).json({ message: 'Job already marked as applied' });
      return;
    }

    profile.appliedJobs = [...(profile.appliedJobs || []), jobObjectId];
    await profile.save();

    res.status(200).json({ message: 'Job marked as applied' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

const jobController = {
  getJobs,
  markJobAsApplied,
};
export default jobController;
