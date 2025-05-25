import { Router } from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../../constents';
import jobController from './job.controller';

const jobRoutes = Router();

jobRoutes.post('/addjob', jobController.saveJob);
jobRoutes.get('/all-jobs', jobController.getAllJobs);
jobRoutes.get('/single-job/:id', jobController.getSingleJob);
jobRoutes.put('/update-job/:id', jobController.updateJob);
jobRoutes.delete('/delete-job/:id', jobController.deleteJob);

jobRoutes.get('/', jobController.getJobs);

jobRoutes.patch(
  '/:id/apply',
  auth([userRole.admin, userRole.user]),
  jobController.markJobAsApplied,
);

export default jobRoutes;
