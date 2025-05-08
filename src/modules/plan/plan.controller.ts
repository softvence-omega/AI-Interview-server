import { Request, Response } from 'express';
import PlanService from './plan.service';
import catchAsync from '../../util/catchAsync';
import sendResponse from '../../util/sendResponse';

const createPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.createPlan(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Plan created successfully',
    data: result,
  });
});

const getAllPlans = catchAsync(async (_req: Request, res: Response) => {
  const result = await PlanService.getAllPlans();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plans fetched successfully',
    data: result,
  });
});

const getPlanById = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.getPlanById(req.params.id);
  if (!result) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan fetched successfully',
    data: result,
  });
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.updatePlan(req.params.id, req.body);
  if (!result) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan updated successfully',
    data: result,
  });
});

const deletePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.deletePlan(req.params.id);
  if (!result) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan deleted successfully',
    data: result,
  });
});

const PlanController = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};

export default PlanController;
