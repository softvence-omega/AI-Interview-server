import express from 'express';
import PlanController from './plan.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../../constents';

const planRoutes = express.Router();

planRoutes.post('/create-plan', auth([userRole.admin, userRole.user]), PlanController.createPlan);
planRoutes.get('/all-plans', PlanController.getAllPlans);
planRoutes.get('/single-plan/:id', PlanController.getPlanById);
planRoutes.put('/update-plan/:id', auth([userRole.admin, userRole.user]), PlanController.updatePlan);
planRoutes.delete('/delete-plan/:id', auth([userRole.admin, userRole.user]), PlanController.deletePlan);

export default planRoutes;
