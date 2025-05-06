import { scrapeLinkedInJobs } from '../../util/scraper';
import { Job } from './job.model';

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
