import { PlanModel } from './plan.model';
import { Plan } from './plan.interface';

const createPlan = async (planData: Plan) => {
  return await PlanModel.create(planData);
};

const getAllPlans = async () => {
  return await PlanModel.find();
};

const getPlanById = async (id: string) => {
  return await PlanModel.findById(id);
};

const updatePlan = async (id: string, updateData: Partial<Plan>) => {
  return await PlanModel.findByIdAndUpdate(id, updateData, { new: true });
};

const deletePlan = async (id: string) => {
  return await PlanModel.findByIdAndDelete(id);
};

const PlanService = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};

export default PlanService;
