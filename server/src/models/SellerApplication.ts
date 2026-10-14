import mongoose, { Document, Schema } from 'mongoose';

export interface ISellerApplication extends Document {
  userId: mongoose.Types.ObjectId;
  storeName: string;
  businessType: string;
  description: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SellerApplicationSchema = new Schema<ISellerApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    storeName: { type: String, required: true, trim: true },
    businessType: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SellerApplication = mongoose.model<ISellerApplication>('SellerApplication', SellerApplicationSchema);
