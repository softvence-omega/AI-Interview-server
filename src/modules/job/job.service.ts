import mongoose from 'mongoose';
import { scrapeLinkedInJobs } from '../../util/scraper';
import { ProfileModel } from '../user/user.model';
import { Job } from './job.model';
import { FilterParams } from './job.interface';

export const fetchAndStoreJobs = async () => {
    try {
      const jobs = await scrapeLinkedInJobs();
      console.log('[SCRAPER RESULT]', jobs?.length || 0);
  
      if (!jobs || jobs.length === 0) {
        console.log('No jobs found from LinkedIn');
        return;
      }
  
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // start of today
  
      // Group jobs by category
      const jobsByCategory: Record<string, typeof jobs> = {};
      for (const job of jobs) {
        const category = job.category || 'uncategorized';
        if (!jobsByCategory[category]) {
          jobsByCategory[category] = [];
        }
        jobsByCategory[category].push(job);
      }
  
      for (const [category, jobsInCategory] of Object.entries(jobsByCategory)) {
        // Get how many jobs already posted today for this category
        const todayCount = await Job.countDocuments({
          category,
          createdAt: { $gte: todayStart },
        });
  
        const remaining = Math.max(0, 5 - todayCount);
        if (remaining === 0) {
          console.log(`[SKIP] Limit reached for category "${category}"`);
          continue;
        }
  
        let added = 0;
        for (const job of jobsInCategory) {
          if (added >= remaining) break;
  
          const exists = await Job.findOne({ link: job.link });
          if (exists) {
            console.log(`[SKIP] Already exists: ${job.link}`);
            continue;
          }
  
          await Job.create(job);
          added++;
          console.log(`[INSERTED] Job in ${category}: ${job.title}`);
        }
      }
    } catch (error) {
      console.error('[ERROR] fetchAndStoreJobs failed:', error);
    }
  };


export const applyToJobService = async (userId: string, jobId: string) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID');
  }

  const jobExists = await Job.findById(jobId);
  if (!jobExists) {
    throw new Error('Job not found');
  }

  const profile = await ProfileModel.findOne({ user_id: userId });
  if (!profile) {
    throw new Error('Profile not found');
  }

  const alreadyApplied = profile.appliedJobs.some(
    (id) => id.toString() === jobId
  );
  if (alreadyApplied) {
    return { message: 'Already applied to this job' };
  }

  // ✅ Push the ObjectId directly
  profile.appliedJobs.push(new mongoose.Types.ObjectId(jobId));
  await profile.save();

  return { message: 'Successfully applied to the job' };
};




  // export const getAllJobsWithAppliedStatusService = async (userId: string) => {
  //   // Fetch the user's profile
  //   const profile = await ProfileModel.findOne({ user_id: userId }).lean();
  
  //   if (!profile) {
  //     throw new Error('Profile not found');
  //   }
  
  //   const appliedJobIds = (profile.appliedJobs || []).map(id => id.toString());
  
  //   // Fetch all jobs
  //   const jobs = await Job.find().lean();
  
  //   // Add `isApplied` flag
  //   const jobsWithStatus = jobs.map(job => ({
  //     ...job,
  //     isApplied: appliedJobIds.includes(job._id.toString()),
  //   }));
  
  //   return jobsWithStatus;
  // };


export const getAllJobsWithAppliedStatusService = async (
  userId: string,
  filters: FilterParams
) => {
  const profile = await ProfileModel.findOne({ user_id: userId }).lean();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const appliedJobIds = (profile.appliedJobs || []).map(id => id.toString());

  // Build MongoDB filter query
  const query: any = {};

  if (filters.company) {
    query.company = { $regex: filters.company, $options: 'i' };
  }
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }
  if (filters.position) {
    query.title = { $regex: filters.position, $options: 'i' };
  }
  if (filters.year) {
    const year = parseInt(filters.year);
    if (!isNaN(year)) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year + 1}-01-01`);
      query.createdAt = { $gte: start, $lt: end };
    }
  }

  const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

  const jobsWithStatus = jobs
    .map(job => {
      const isApplied = appliedJobIds.includes(job._id.toString());
      return { ...job, isApplied };
    })
    .filter(job => {
      if (filters.isApplied === 'true') return job.isApplied;
      if (filters.isApplied === 'false') return !job.isApplied;
      return true;
    });

  return jobsWithStatus;
};
