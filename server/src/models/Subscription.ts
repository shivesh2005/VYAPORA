import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  sellerId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usage: {
    productsCount: number;
    aiRequestsThisMonth: number;
  };
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active', index: true },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, required: true },
    usage: {
      productsCount: { type: Number, default: 0 },
      aiRequestsThisMonth: { type: Number, default: 0 },
    },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
