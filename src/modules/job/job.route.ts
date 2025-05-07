import { Router } from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../../constents';
import jobController from './job.controller';

const jobRoutes = Router();

jobRoutes.get('/', jobController.getJobs);

jobRoutes.patch("/:id/apply", auth([userRole.admin, userRole.user]), jobController.markJobAsApplied);

export default jobRoutes;
