import { PlanModel } from '../modules/plan/plan.model';

const planSeeder = async () => {
  const plans = [
    {
      name: "Free Plan",
      description:
        "Track and prepare your job search using our free version. It's always free, no credit card needed.",
      priceMonthly: 0,
      priceLabel: "/monthly",
      priceId: "", // Optional for free
      features: [
        "1 Free Mock Interview",
        "Track up to 10 Jobs per month",
        "Personalized Feedback",
        "Access to AI Feedback 1 Interview",
        "Progress Tracking",
        "Recommendation for Improvement",
      ],
    },
    {
      name: "Premium Plan",
      description:
        "Get full access to Inprep.ai App and web version. Track and prepare for any job using the AI by your side.",
      priceMonthly: 19.99,
      priceLabel: "/monthly",
      priceId: "price_1RQh51AeQO2CXKLXBTbmxa3M",
      // priceId: "price_1RW9q0EY6Wsqp4kbAOMOpB5U",
      features: [
        "10 Mock Interviews",
        "Unlimited Jobs Tracking",
        "Personalized Feedback",
        "Access to AI Feedback 10 Interview",
        "Progress Tracking",
        "Recommendation for Improvement",
      ],
    },
    {
      name: "Pay-Per-Interview",
      description:
        "Ran out of interview slots? No need to worry, buy interview when you need it.",
      priceMonthly: 4.99,
      priceLabel: "/Per Interview",
      priceId: "price_1RQh5lAeQO2CXKLX0brJrWGJ",
      // priceId: "price_1RW9qlEY6Wsqp4kbjynhIyR9",
      features: [
        "Personalized Feedback",
        "Access to AI Feedback",
        "Progress Tracking",
        "Recommendation for Improvement",
      ],
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

      console.log(`✅ Created plan: ${created.name}`);
    } else {
      console.log(`✅ Plan already exists: ${plan.name}`);
    }
  }
};

export default planSeeder;
