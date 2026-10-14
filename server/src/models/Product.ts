import mongoose, { Document, Schema } from 'mongoose';

export interface IVariant {
  name: string; // e.g. "Size", "Color"
  options: string[]; // e.g. ["S", "M", "L"] or ["Space Gray", "Midnight Blue"]
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  subcategory?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  discountBadge?: string;
  sku: string;
  stock: number;
  variants: IVariant[];
  sellerId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  rating: number;
  numReviews: number;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  options: [{ type: String, required: true }],
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, default: '', trim: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, default: 0 },
    discountBadge: { type: String, default: '' },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    variants: [VariantSchema],
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', index: true },
    rating: { type: Number, default: 0, min: 0, max: 5, index: true },
    numReviews: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Indexes for high performance search & filter queries
ProductSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });
ProductSchema.index({ isPublished: 1, category: 1, price: 1, rating: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
