import mongoose, { Schema } from 'mongoose';

const PlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  priceMonthly: { type: Number, required: true },
  features: { type: String, required: true },
});

export const PlanModel = mongoose.model('Plan', PlanSchema);
