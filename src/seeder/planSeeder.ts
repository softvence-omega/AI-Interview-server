import { PlanModel } from '../modules/plan/plan.model';

const planSeeder = async () => {
  const plans = [
    {
      name: 'Premium',
      priceMonthly: 19.99,
      features: '10 Mock Interviews, Unlimited Jobs Tracking, Access to AI Feedback 10 Interview, Personalized Feedback, Generate Custom Mock Interview, Progress Tracking, Recommendation for Improvement',
    },
    {
      name: 'Pay-Per',
      priceMonthly: 4.99,
      features: 'Single Job Tracking, Access to AI Feedback, Generate Custom Mock Interview, Personalized Feedback, Progress Tracking, Recommendation for Improvement',
    },
  ];

  for (const plan of plans) {
    const exists = await PlanModel.findOne({ name: plan.name });

    if (!exists) {
      console.log(`Seeding plan: ${plan.name}`);
      const created = await PlanModel.create(plan);

      if (!created) {
        throw new Error(`Failed to create plan: ${plan.name}`);
      }

      console.log(`Created plan: ${created.name}`);
    } else {
      console.log(`Plan already exists: ${plan.name}`);
    }
  }
};

export default planSeeder;
