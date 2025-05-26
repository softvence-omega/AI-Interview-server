import { Router } from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../../constents';
import jobController from './job.controller';

const jobRoutes = Router();

jobRoutes.post('/addjob', jobController.saveJob);
jobRoutes.get('/all-jobs', jobController.getAllJobs);

// New route to apply to a job
jobRoutes.post('/apply/:jobId', auth([userRole.admin, userRole.user]), jobController.applyToJobController);
// get applied job by user
jobRoutes.get('/applied-job', auth([userRole.admin, userRole.user]), jobController.getAllJobsWithAppliedStatus );

jobRoutes.get('/single-job/:id', auth([userRole.admin, userRole.user]), jobController.getSingleJob);
jobRoutes.put('/update-job/:id', auth([userRole.admin, userRole.user]), jobController.updateJob);
jobRoutes.delete('/delete-job/:id', auth([userRole.admin, userRole.user]), jobController.deleteJob);

jobRoutes.get('/', auth([userRole.admin, userRole.user]), jobController.getJobs);

jobRoutes.patch(
  '/:id/apply',
  auth([userRole.admin, userRole.user]),
  jobController.markJobAsApplied,
);

export default jobRoutes;
