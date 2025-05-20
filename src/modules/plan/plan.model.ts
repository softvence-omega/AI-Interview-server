import mongoose, { Schema } from 'mongoose';

const PlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    priceMonthly: { type: Number, required: true },
    priceLabel: { type: String, required: true },
    priceId: { type: String, required: false },
    features: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);

export const PlanModel = mongoose.model('Plan', PlanSchema);
