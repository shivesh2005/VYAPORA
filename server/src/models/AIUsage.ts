import mongoose, { Document, Schema } from 'mongoose';

export type AIRequestStatus =
  | 'success'
  | 'failed'
  | 'rate_limited'
  | 'quota_exceeded'
  | 'invalid_credentials';

export interface IAIUsage {
  _id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  accountId?: mongoose.Types.ObjectId;
  conversationId?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  requestStatus: AIRequestStatus;
  estimatedCost?: number; // Estimated reference cost in USD (Note: Reference only, not provider bill)
  mode: 'gemini_official' | 'catalog_grounded_demo';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Store', index: true },
    conversationId: { type: String, index: true },
    model: { type: String, required: true, default: 'gemini-2.5-flash' },
    inputTokens: { type: Number, required: true, default: 0 },
    outputTokens: { type: Number, required: true, default: 0 },
    totalTokens: { type: Number, required: true, default: 0 },
    cachedTokens: { type: Number, default: 0 },
    requestStatus: {
      type: String,
      enum: ['success', 'failed', 'rate_limited', 'quota_exceeded', 'invalid_credentials'],
      required: true,
      default: 'success',
    },
    estimatedCost: { type: Number, default: 0 },
    mode: {
      type: String,
      enum: ['gemini_official', 'catalog_grounded_demo'],
      required: true,
      default: 'gemini_official',
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// Compound indexes for rapid analytics & quota aggregations
AIUsageSchema.index({ userId: 1, createdAt: -1 });
AIUsageSchema.index({ createdAt: -1 });
AIUsageSchema.index({ model: 1, requestStatus: 1 });

export const AIUsage = mongoose.model<IAIUsage>('AIUsage', AIUsageSchema);
