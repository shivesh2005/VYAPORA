export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
  preferences?: {
    newsletter: boolean;
    orderUpdates: boolean;
    currency: string;
  };
  createdAt?: string;
}

export interface StoreLayoutSettings {
  theme: 'modern' | 'minimal' | 'bold';
  showBanner: boolean;
  featuredTagline: string;
  productGridColumns: number;
}

export interface Store {
  _id: string;
  sellerId: string;
  storeName: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  brandAccentColor: string;
  contactEmail: string;
  contactPhone: string;
  layoutSettings: StoreLayoutSettings;
  isApproved: boolean;
  totalSales: number;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  _id: string;
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
  variants: ProductVariant[];
  sellerId: any;
  storeId?: any;
  rating: number;
  numReviews: number;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  iconName?: string;
  itemCount: number;
  isFeatured: boolean;
}

export interface CartItem {
  _id: string;
  productId: Product;
  quantity: number;
  selectedVariant?: {
    name: string;
    value: string;
  };
  priceAtAddition: number;
}

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  appliedCoupon?: string;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

export interface Address {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: any;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
  sellerId: string;
  storeId?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
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
  statusHistory: OrderStatusHistory[];
  trackingNumber: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: 'STARTER' | 'GROWTH' | 'SCALE';
  slug: string;
  tagline: string;
  price: number;
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
}

export interface Subscription {
  _id: string;
  sellerId: string;
  storeId?: string;
  planId: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usage: {
    productsCount: number;
    aiRequestsThisMonth: number;
  };
  cancelAtPeriodEnd: boolean;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  suggestions?: string[];
  mode?: 'gemini_official' | 'live_llm' | 'catalog_grounded_demo';
  tokensUsed?: number;
  timestamp?: string;
}

export interface AIStatusInfo {
  status:
    | 'verified'
    | 'configured'
    | 'missing_key'
    | 'invalid_credentials'
    | 'permission_denied'
    | 'quota_exceeded'
    | 'model_unavailable'
    | 'service_error';
  keyPresent: boolean;
  model: string;
  message: string;
  provider: string;
  sdkVersion: string;
  checkedAt: string | null;
  demoFallbackActive: boolean;
  isEnabled?: boolean;
}

export interface AdminAIConfig {
  provider: string;
  model: string;
  isEnabled: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'not_configured';
  hasApiKey: boolean;
  keyMask?: string;
  lastVerifiedAt?: string | null;
  lastVerificationError?: string;
  supportedModels: string[];
}

export interface AIUsageInfo {
  userId?: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
  estimatedCostUSD: number;
  thisMonthRequests: number;
  quotaLimit: number;
  quotaRemaining: number;
  planName: string;
  disclaimer: string;
}
