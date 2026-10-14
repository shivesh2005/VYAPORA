import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  sellerId: mongoose.Types.ObjectId;
  storeName: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  brandAccentColor: string;
  contactEmail: string;
  contactPhone: string;
  layoutSettings: {
    theme: 'modern' | 'minimal' | 'bold';
    showBanner: boolean;
    featuredTagline: string;
    productGridColumns: number;
  };
  isApproved: boolean;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    storeName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=256&q=80' },
    bannerUrl: { type: String, default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
    brandAccentColor: { type: String, default: '#7C3AED' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    layoutSettings: {
      theme: { type: String, enum: ['modern', 'minimal', 'bold'], default: 'modern' },
      showBanner: { type: Boolean, default: true },
      featuredTagline: { type: String, default: 'Curated Premium Marketplace Collection' },
      productGridColumns: { type: Number, default: 4 },
    },
    isApproved: { type: Boolean, default: true },
    totalSales: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Store = mongoose.model<IStore>('Store', StoreSchema);
