export interface SeedPlan {
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

export const seedPlans: SeedPlan[] = [
  {
    name: 'STARTER',
    slug: 'starter',
    tagline: 'Ideal for independent emerging creators and boutique sellers.',
    price: 999,
    billingPeriod: 'monthly',
    features: [
      'Up to 10 active product listings',
      '50 monthly AI assistant recommendations',
      'Standard store dashboard & order tracking',
      'Community support access',
      'Basic storefront layout',
    ],
    limits: {
      maxProducts: 10,
      maxMonthlyAiRequests: 50,
      advancedAnalytics: false,
      couponManagement: false,
      customStoreBranding: false,
      prioritySupport: false,
    },
    isPopular: false,
  },
  {
    name: 'GROWTH',
    slug: 'growth',
    tagline: 'Designed for scaling multi-product merchants and digital brands.',
    price: 2499,
    billingPeriod: 'monthly',
    features: [
      'Up to 50 active product listings',
      '250 monthly AI shopping assistant calls',
      'Advanced multi-vendor sales analytics & charts',
      'Custom discount coupon & promotion creator',
      'Custom storefront accent color & logo branding',
      'Standard business hours email support',
    ],
    limits: {
      maxProducts: 50,
      maxMonthlyAiRequests: 250,
      advancedAnalytics: true,
      couponManagement: true,
      customStoreBranding: true,
      prioritySupport: false,
    },
    isPopular: true,
  },
  {
    name: 'SCALE',
    slug: 'scale',
    tagline: 'Complete enterprise commerce power for top-tier marketplace brands.',
    price: 5999,
    billingPeriod: 'monthly',
    features: [
      'Up to 200 active product listings',
      '1,000 monthly AI shopping assistant calls',
      'Deep cohort revenue & predictive inventory alerts',
      'Full store custom CSS theme & hero banner upload',
      'Priority 24/7 account management & SLA',
      'Automated batch order processing & bulk updates',
    ],
    limits: {
      maxProducts: 200,
      maxMonthlyAiRequests: 1000,
      advancedAnalytics: true,
      couponManagement: true,
      customStoreBranding: true,
      prioritySupport: true,
    },
    isPopular: false,
  },
];

export const seedCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Next-generation computing, smart home accessories, and ultra-fast tech.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    iconName: 'Cpu',
    itemCount: 8,
    isFeatured: true,
  },
  {
    name: 'Audio & Sound',
    slug: 'audio-and-sound',
    description: 'Audiophile headphones, noise-canceling earbuds, and studio monitors.',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    iconName: 'Headphones',
    itemCount: 6,
    isFeatured: true,
  },
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-and-apparel',
    description: 'Contemporary streetwear, minimal luxury apparel, and organic fabrics.',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    iconName: 'Shirt',
    itemCount: 6,
    isFeatured: true,
  },
  {
    name: 'Smart Living',
    slug: 'smart-living',
    description: 'Ergonomic workspace gear, ambient LED lighting, and productivity essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    iconName: 'Home',
    itemCount: 4,
    isFeatured: true,
  },
  {
    name: 'Accessories & Bags',
    slug: 'accessories-and-bags',
    description: 'Waterproof backpacks, leather organizers, travel pouches, and daily gear.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    iconName: 'ShoppingBag',
    itemCount: 4,
    isFeatured: true,
  },
  {
    name: 'Home & Workspace',
    slug: 'home-and-workspace',
    description: 'Ergonomic monitor mounts, desk mats, minimalist organizers, and lamps.',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    iconName: 'Briefcase',
    itemCount: 4,
    isFeatured: true,
  },
];

export const seedCoupons = [
  {
    code: 'VYAPORA10',
    discountType: 'percentage' as const,
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 1500,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 5000,
    usageCount: 142,
    isActive: true,
  },
  {
    code: 'EJAN10',
    discountType: 'percentage' as const,
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 1500,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 5000,
    usageCount: 142,
    isActive: true,
  },
  {
    code: 'NEXORA10',
    discountType: 'percentage' as const,
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 1500,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 5000,
    usageCount: 142,
    isActive: true,
  },
  {
    code: 'SAVE20',
    discountType: 'percentage' as const,
    discountValue: 20,
    minOrderValue: 2499,
    maxDiscount: 3000,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 2000,
    usageCount: 89,
    isActive: true,
  },
  {
    code: 'WELCOME50',
    discountType: 'fixed' as const,
    discountValue: 500,
    minOrderValue: 1999,
    expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    usageLimit: 1000,
    usageCount: 312,
    isActive: true,
  },
];
