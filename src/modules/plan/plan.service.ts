import { PlanModel } from './plan.model';
import { Plan } from './plan.interface';
import stripe from '../../config/stripe';

// const createPlan = async (planData: Plan) => {
//   return await PlanModel.create(planData);
// };

const createPlan = async (planData: Plan) => {
  // 1. Create a Product on Stripe
  const product = await stripe.products.create({
    name: planData.name,
    description: planData.description,
    metadata: {
      priceMonthly: planData.priceMonthly.toString(),
      priceLabel: planData.priceLabel,
    },
  });

  // 2. Create a Price on Stripe associated with the Product
  const price = await stripe.prices.create({
    unit_amount: planData.priceMonthly * 100, // Convert to cents
    currency: 'usd',
    recurring: { interval: 'month' },
    product: product.id,
  });

  // 2. Create a Plan in DB, storing Stripe Product ID as `priceId`
  const planWithStripe = await PlanModel.create({
    ...planData,
    priceId: price.id, // Save Stripe product ID
  });

  return planWithStripe;
};

const getAllPlans = async () => {
  return await PlanModel.find();
};

const getPlanById = async (id: string) => {
  return await PlanModel.findById(id);
};

// const updatePlan = async (id: string, updateData: Partial<Plan>) => {
//   return await PlanModel.findByIdAndUpdate(id, updateData, { new: true });
// };


const updatePlan = async (id: string, updateData: Partial<Plan>) => {
  // 1. Fetch the existing plan from the database
  const existingPlan = await PlanModel.findById(id);
  if (!existingPlan) {
    throw new Error('Plan not found');
  }

  // 2. If no updates to name, description, priceMonthly, priceLabel, or features, update DB only
  if (
    !updateData.name &&
    !updateData.description &&
    (updateData.priceMonthly === undefined || updateData.priceMonthly === existingPlan.priceMonthly) &&
    !updateData.priceLabel &&
    !updateData.features
  ) {
    try {
      return await PlanModel.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating plan in database:', error);
      throw new Error('Failed to update plan in database');
    }
  }

  // 3. Check if priceId exists and is a string
  const currentPriceId = existingPlan.priceId;
  if (typeof currentPriceId !== 'string') {
    console.error('Invalid or missing priceId:', currentPriceId);
    throw new Error('Plan is missing a valid Stripe priceId');
  }

  // 4. Verify the current price is active
  try {
    const currentPrice = await stripe.prices.retrieve(currentPriceId);
    if (!currentPrice.active) {
      console.warn('Current price is inactive:', currentPriceId);
    }
  } catch (error) {
    console.error('Error retrieving current Stripe price:', error);
    throw new Error('Failed to verify current Stripe price');
  }

  // 5. Retrieve the Stripe product ID from the existing plan's price
  let productId: string;
  try {
    const existingPrice = await stripe.prices.retrieve(currentPriceId);
    if (!existingPrice || !existingPrice.product) {
      throw new Error('Invalid or missing Stripe product for this plan');
    }
    productId = typeof existingPrice.product === 'string' 
      ? existingPrice.product 
      : existingPrice.product.id;
  } catch (error) {
    console.error('Error retrieving Stripe price:', error);
    throw new Error('Failed to retrieve Stripe price or product');
  }

  // 6. Update Stripe product if name, description, priceMonthly, or priceLabel changed
  if (updateData.name || updateData.description || updateData.priceMonthly !== undefined || updateData.priceLabel) {
    try {
      const priceMonthlyValue = typeof updateData.priceMonthly === 'number' 
        ? updateData.priceMonthly 
        : existingPlan.priceMonthly;
      await stripe.products.update(productId, {
        name: (updateData.name ?? existingPlan.name) as string,
        description: (updateData.description ?? existingPlan.description) as string,
        metadata: {
          priceMonthly: (priceMonthlyValue as number).toString(),
          priceLabel: (updateData.priceLabel ?? existingPlan.priceLabel) as string,
        },
      });
    } catch (error) {
      console.error('Error updating Stripe product:', error);
      throw new Error('Failed to update Stripe product');
    }
  }

  // 7. If priceMonthly changed, create a new Stripe price with active: true
  let newPriceId: string = currentPriceId;
  if (updateData.priceMonthly !== undefined && updateData.priceMonthly !== existingPlan.priceMonthly) {
    try {
      const priceMonthlyValue = typeof updateData.priceMonthly === 'number' 
        ? updateData.priceMonthly 
        : existingPlan.priceMonthly;
      const newPrice = await stripe.prices.create({
        unit_amount: (priceMonthlyValue as number) * 100, // Convert to cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: productId,
        active: true, // Explicitly set the new price as active
      });

      // 8. Verify the new price is active
      const createdPrice = await stripe.prices.retrieve(newPrice.id);
      if (!createdPrice.active) {
        console.error('Newly created price is inactive:', newPrice.id);
        throw new Error('Failed to create an active Stripe price');
      }

      // 9. Deactivate old Stripe price
      try {
        await stripe.prices.update(currentPriceId, {
          active: false,
        });
      } catch (err) {
        console.warn('Failed to deactivate old price:', err);
      }

      newPriceId = newPrice.id;
    } catch (error) {
      console.error('Error creating new Stripe price:', error);
      throw new Error('Failed to create new Stripe price');
    }
  }

  // 10. Update the plan in the database
  try {
    const priceMonthlyValue = typeof updateData.priceMonthly === 'number' 
      ? updateData.priceMonthly 
      : existingPlan.priceMonthly;
    const updatedPlan = await PlanModel.findByIdAndUpdate(
      id,
      {
        name: updateData.name ?? existingPlan.name,
        description: updateData.description ?? existingPlan.description,
        priceMonthly: priceMonthlyValue,
        priceLabel: updateData.priceLabel ?? existingPlan.priceLabel,
        priceId: newPriceId,
        features: updateData.features ?? existingPlan.features,
      },
      { new: true }
    );
    return updatedPlan;
  } catch (error) {
    console.error('Error updating plan in database:', error);
    throw new Error('Failed to update plan in database');
  }
};


// const deletePlan = async (id: string) => {
//   return await PlanModel.findByIdAndDelete(id);
// };

const deletePlan = async (id: string) => {
  // 1. Fetch the existing plan from the database
  const existingPlan = await PlanModel.findById(id);
  if (!existingPlan) {
    throw new Error('Plan not found');
  }

  // 2. Check if priceId exists and is a string
  const currentPriceId = existingPlan.priceId;
  if (typeof currentPriceId !== 'string') {
    console.error('Invalid or missing priceId:', currentPriceId);
    throw new Error('Plan is missing a valid Stripe priceId');
  }

  // 3. Retrieve the Stripe product ID from the existing plan's price
  let productId: string;
  try {
    const existingPrice = await stripe.prices.retrieve(currentPriceId);
    if (!existingPrice || !existingPrice.product) {
      throw new Error('Invalid or missing Stripe product for this plan');
    }
    productId = typeof existingPrice.product === 'string' 
      ? existingPrice.product 
      : existingPrice.product.id;
  } catch (error) {
    console.error('Error retrieving Stripe price:', error);
    throw new Error('Failed to retrieve Stripe price or product');
  }

  // 4. Deactivate the Stripe price
  try {
    await stripe.prices.update(currentPriceId, {
      active: false,
    });
  } catch (err) {
    console.warn('Failed to deactivate Stripe price:', err);
  }

  // 5. Delete the Stripe product
  try {
    await stripe.products.del(productId);
  } catch (error) {
    console.warn('Error deleting Stripe product:', error);
    // Log the error but do not block database deletion
  }

  // 6. Delete the plan from the database
  try {
    const deletedPlan = await PlanModel.findByIdAndDelete(id);
    return deletedPlan;
  } catch (error) {
    console.error('Error deleting plan from database:', error);
    throw new Error('Failed to delete plan from database');
  }
};

const PlanService = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};

export default PlanService;
