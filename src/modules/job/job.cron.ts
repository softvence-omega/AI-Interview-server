import cron from 'node-cron';
import { fetchAndStoreJobs } from './job.service';

export const startJobSyncCron = () => {
  cron.schedule('*/6 * * *', async () => {
    console.log('[CRON] Fetching latest LinkedIn jobs...');
    await fetchAndStoreJobs();
  });
};

// automatic call the job every 10 seconds
// startJobSyncCron();
