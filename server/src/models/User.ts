import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
  isSuspended: boolean;
  preferences: {
    newsletter: boolean;
    orderUpdates: boolean;
    currency: string;
  };
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer', index: true },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
    phone: { type: String, default: '' },
    isSuspended: { type: Boolean, default: false },
    preferences: {
      newsletter: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      currency: { type: String, default: 'INR' },
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
