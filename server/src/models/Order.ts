import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
  sellerId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  storeIds: mongoose.Types.ObjectId[];
  sellerIds: mongoose.Types.ObjectId[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: 'demo_paid' | 'pending' | 'failed';
  paymentMethod: 'demo_card' | 'demo_upi' | 'cod';
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  statusHistory: IOrderStatusHistory[];
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: {
      name: { type: String },
      value: { type: String },
    },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
  },
  { _id: true }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [OrderItemSchema],
    storeIds: [{ type: Schema.Types.ObjectId, ref: 'Store' }],
    sellerIds: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentStatus: {
      type: String,
      enum: ['demo_paid', 'pending', 'failed'],
      default: 'demo_paid',
    },
    paymentMethod: {
      type: String,
      enum: ['demo_card', 'demo_upi', 'cod'],
      default: 'demo_card',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    statusHistory: [OrderStatusHistorySchema],
    trackingNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
