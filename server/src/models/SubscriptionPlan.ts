import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: 'STARTER' | 'GROWTH' | 'SCALE';
  slug: string;
  tagline: string;
  price: number; // in INR
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxProducts: number;
    maxMonthlyAiRequests: number;
    advancedAnalytics: boolean;
    couponManagement: boolean;
    customStoreBranding: boolean;
    prioritySupport: boolean;
  };
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, enum: ['STARTER', 'GROWTH', 'SCALE'], required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    tagline: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    billingPeriod: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    features: [{ type: String, required: true }],
    limits: {
      maxProducts: { type: Number, required: true },
      maxMonthlyAiRequests: { type: Number, required: true },
      advancedAnalytics: { type: Boolean, default: false },
      couponManagement: { type: Boolean, default: false },
      customStoreBranding: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
