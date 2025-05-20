// models/payment.model.ts
import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: String },
    sessionId: { type: String, unique: true },
    planId: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
