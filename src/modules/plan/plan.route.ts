import express from 'express';
import PlanController from './plan.controller';

const planRoutes = express.Router();

planRoutes.post('/create-plan', PlanController.createPlan);
planRoutes.get('/all-plans', PlanController.getAllPlans);
planRoutes.get('/single-plan/:id', PlanController.getPlanById);
planRoutes.put('/update-plan/:id', PlanController.updatePlan);
planRoutes.delete('/delete-plan/:id', PlanController.deletePlan);

export default planRoutes;
