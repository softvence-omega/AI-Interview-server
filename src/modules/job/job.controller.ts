import { Request, Response } from 'express';
import { Job } from './job.model';
import { ProfileModel } from '../user/user.model';
import mongoose from 'mongoose';
import {
  applyToJobService,
  getAllJobsWithAppliedStatusService,
} from './job.service';

// Create or update job (if already exists by unique link)
const saveJob = async (req: Request, res: Response) => {
  try {
    const { link } = req.body;

    const existingJob = await Job.findOne({ link });
    if (existingJob) {
      res.status(200).json({ message: 'Job already exists', job: existingJob });
      return;
    }

    const newJob = new Job(req.body);
    await newJob.save();

    res.status(201).json({ message: 'Job saved successfully', job: newJob });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all jobs
const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const applyToJobController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!jobId) {
      res.status(400).json({ message: 'Job ID is required' });
      return;
    }

    const result = await applyToJobService(userId, jobId);
    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
    return;
  }
};

// export const getAllJobsWithAppliedStatus = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       res.status(401).json({ message: 'Unauthorized' });
//       return;
//     }

//     const jobs = await getAllJobsWithAppliedStatusService(userId);
//     res.status(200).json(jobs);
//     return;
//   } catch (error: any) {
//     res.status(500).json({ message: error.message || 'Internal Server Error' });
//     return;
//   }
// };

export const getAllJobsWithAppliedStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const filters = {
      company: req.query.company as string,
      location: req.query.location as string,
      position: req.query.position as string,
      year: req.query.year as string,
      isApplied: req.query.isApplied as string, // "true" or "false"
    };

    const jobs = await getAllJobsWithAppliedStatusService(userId, filters);

    res.status(200).json(jobs);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message || 'Internal Server Error',
    });
    return;
  }
};

// const getSingleJob = async (req: Request, res: Response) => {
//   try {
//     const job = await Job.findById(req.params.id);
//     if (!job) {
//       res.status(404).json({ message: 'Job not found' });
//       return;
//     }
//     res.json(job);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

const getSingleJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.status(400).json({ message: 'Invalid Job ID' });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    const profile = await ProfileModel.findOne({ user_id: userId });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const hasSeen = profile.seenJobs.some(
      (seenJobId) => seenJobId.toString() === jobId
    );

    // If the job hasn't been seen before, update seenJobs and decrement jobsAvailable
    if (!hasSeen) {
      if (profile.jobsAvailable !== 'unlimited' && profile.jobsAvailable <= 0) {
        res.status(403).json({
          message: 'You have reached your job view limit. Please purchase a plan.',
        });
        return;
      }

      profile.seenJobs.push(job._id);

      if(profile.jobsAvailable !== 'unlimited'){
        profile.jobsAvailable = profile.jobsAvailable - 1;
      }
      
      await profile.save();
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getJobs = async (req: Request, res: Response) => {
  try {
    const { title, company, location, year, status } = req.query;
    const userId = (req as any).user?.id; // from auth middleware

    const query: any = {};

    if (title) {
      query.title = { $regex: new RegExp(title as string, 'i') };
    }

    if (company) {
      query.company = { $regex: new RegExp(company as string, 'i') };
    }

    if (location) {
      query.location = { $regex: new RegExp(location as string, 'i') };
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
        res.status(404).json({ message: 'User profile not found' });
        return;
      }

      const appliedJobIds = new Set(
        profile.appliedJobs.map((jobId) => jobId.toString()),
      );

      const filteredJobs =
        status === 'applied'
          ? jobs.filter((job) => appliedJobIds.has(job._id.toString()))
          : status === 'not_applied'
            ? jobs.filter((job) => !appliedJobIds.has(job._id.toString()))
            : jobs;

      console.log(
        `[GET /jobs] Filtered by status=${status}, Found: ${filteredJobs.length}`,
      );
      res.json(filteredJobs);
      return;
    }

    console.log(`[GET /jobs] Found: ${jobs.length}`);
    res.json(jobs);
  } catch (error) {
    console.error('[GET /jobs] Error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs', error });
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
  saveJob,
  getAllJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  getAllJobsWithAppliedStatus,
  applyToJobController,
};
export default jobController;
