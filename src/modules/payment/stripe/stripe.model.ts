// models/payment.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId?: string;
  sessionId?: string;
  planId?: string;
  status?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'UserCollection', required: true },
    subscriptionId: { type: String },
    sessionId: { type: String, unique: true },
    planId: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
