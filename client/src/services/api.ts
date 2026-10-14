import {
  User,
  Store,
  Product,
  Category,
  CartItem,
  CartSummary,
  Address,
  Order,
  Review,
  SubscriptionPlan,
  Subscription,
  AIMessage,
  AIStatusInfo,
  AdminAIConfig,
  AIUsageInfo,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Check if token is stored in localStorage as fallback
  const token =
    (typeof window !== 'undefined' &&
      window.localStorage &&
      (localStorage.getItem('vyapora_token') ||
        localStorage.getItem('ejan_token') ||
        localStorage.getItem('nexora_token'))) ||
    null;
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Includes HTTP-only cookies
  });

  const data = await res.json().catch(() => ({ success: false, message: 'Server response parsing failed' }));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    register: (body: { name: string; email: string; password: string; role?: 'customer' | 'seller' }) =>
      request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: User; store?: Store; subscription?: Subscription }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      ),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    getMe: () =>
      request<{ success: boolean; user: User; store?: Store; subscription?: Subscription }>('/auth/me'),
  },

  // User & Profile
  user: {
    updateProfile: (body: Partial<User>) =>
      request<{ success: boolean; user: User }>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ success: boolean; message: string }>('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    getAddresses: () => request<{ success: boolean; addresses: Address[] }>('/users/addresses'),
    addAddress: (body: Omit<Address, '_id' | 'userId'>) =>
      request<{ success: boolean; address: Address }>('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteAddress: (id: string) =>
      request<{ success: boolean }>('/users/addresses/' + id, { method: 'DELETE' }),
    setDefaultAddress: (id: string) =>
      request<{ success: boolean; address: Address }>('/users/addresses/' + id + '/default', {
        method: 'PATCH',
      }),
  },

  // Products Catalog
  products: {
    list: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      return request<{
        success: boolean;
        products: Product[];
        pagination: {
          page: number;
          limit: number;
          totalProducts: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      }>(`/products?${searchParams.toString()}`);
    },
    getByIdOrSlug: (idOrSlug: string) =>
      request<{ success: boolean; product: Product }>(`/products/${idOrSlug}`),
    getRelated: (id: string) =>
      request<{ success: boolean; products: Product[] }>(`/products/${id}/related`),
    getFeatured: () =>
      request<{
        success: boolean;
        featured: Product[];
        bestsellers: Product[];
        newArrivals: Product[];
      }>('/products/featured'),
  },

  // Categories
  categories: {
    list: () => request<{ success: boolean; categories: Category[] }>('/categories'),
    getBySlug: (slug: string) =>
      request<{ success: boolean; category: Category; products: Product[] }>(`/categories/${slug}`),
  },

  // Cart
  cart: {
    get: () =>
      request<{ success: boolean; cart: any; items: CartItem[]; summary: CartSummary }>('/cart'),
    add: (body: { productId: string; quantity?: number; selectedVariant?: any }) =>
      request<{ success: boolean; message: string; cart: any; items: CartItem[]; summary: CartSummary }>(
        '/cart/add',
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      ),
    updateQuantity: (itemId: string, quantity: number) =>
      request<{ success: boolean; cart: any; items: CartItem[]; summary: CartSummary }>(
        `/cart/items/${itemId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ quantity }),
        }
      ),
    remove: (itemId: string) =>
      request<{ success: boolean; message: string; cart: any; items: CartItem[]; summary: CartSummary }>(
        `/cart/items/${itemId}`,
        { method: 'DELETE' }
      ),
    applyCoupon: (couponCode: string) =>
      request<{ success: boolean; message: string; cart: any; items: CartItem[]; summary: CartSummary }>(
        '/cart/coupon',
        {
          method: 'POST',
          body: JSON.stringify({ couponCode }),
        }
      ),
    removeCoupon: () =>
      request<{ success: boolean; message: string; cart: any; items: CartItem[]; summary: CartSummary }>(
        '/cart/coupon',
        { method: 'DELETE' }
      ),
    clear: () => request<{ success: boolean }>('/cart/clear', { method: 'DELETE' }),
  },

  // Wishlist
  wishlist: {
    get: () => request<{ success: boolean; wishlist: Product[] }>('/wishlist'),
    toggle: (productId: string) =>
      request<{ success: boolean; message: string; action: 'added' | 'removed'; wishlist: Product[] }>(
        '/wishlist/toggle',
        {
          method: 'POST',
          body: JSON.stringify({ productId }),
        }
      ),
  },

  // Orders
  orders: {
    create: (body: { shippingAddress: any; paymentMethod: string; couponCode?: string }) =>
      request<{ success: boolean; message: string; order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    list: () => request<{ success: boolean; orders: Order[] }>('/orders'),
    getById: (id: string) => request<{ success: boolean; order: Order }>(`/orders/${id}`),
    cancel: (id: string, reason?: string) =>
      request<{ success: boolean; message: string; order: Order }>(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  // Reviews
  reviews: {
    getByProduct: (productId: string) =>
      request<{ success: boolean; reviews: Review[] }>(`/reviews/product/${productId}`),
    create: (productId: string, body: { rating: number; title: string; comment: string }) =>
      request<{ success: boolean; message: string; review: Review }>(`/reviews/product/${productId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  // Coupons
  coupons: {
    validate: (code: string, orderAmount: number) =>
      request<{ success: boolean; message: string; coupon: any }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, orderAmount }),
      }),
  },

  // AI Assistant (Google Gemini & Catalog Intelligence)
  ai: {
    chat: (body: { message: string; sessionId?: string; history?: any[]; language?: 'en' | 'hi' }) =>
      request<{
        success: boolean;
        sessionId: string;
        reply: string;
        products: Product[];
        suggestions: string[];
        mode: 'gemini_official' | 'catalog_grounded_demo';
        tokensUsed?: number;
        quotaRemaining?: number;
      }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    translate: (body: { text: string; targetLanguage: 'en' | 'hi' }) =>
      request<{
        success: boolean;
        translatedText: string;
        targetLanguage: 'en' | 'hi';
        mode: string;
        tokensUsed?: number;
      }>('/ai/translate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getStatus: () => request<{ success: boolean; ai: AIStatusInfo }>('/ai/status'),
    verifyKey: (body?: { apiKey?: string; model?: string }) =>
      request<{ success: boolean; verification: AIStatusInfo }>('/ai/verify', {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),
    getConfig: () => request<{ success: boolean; config: AdminAIConfig }>('/ai/config'),
    saveConfig: (body: { apiKey?: string; model?: string; provider?: string }) =>
      request<{ success: boolean; message: string; config: AdminAIConfig }>('/ai/config/save', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    verifyConfig: (body?: { apiKey?: string; model?: string }) =>
      request<{ success: boolean; verification: AIStatusInfo }>('/ai/config/verify', {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),
    toggleAssistant: (isEnabled: boolean) =>
      request<{ success: boolean; message: string; isEnabled: boolean }>('/ai/config/toggle', {
        method: 'POST',
        body: JSON.stringify({ isEnabled }),
      }),
    disconnectProvider: (confirm: boolean = true) =>
      request<{ success: boolean; message: string; config: AdminAIConfig }>('/ai/config/disconnect', {
        method: 'POST',
        body: JSON.stringify({ confirm }),
      }),
    testRequest: (prompt?: string) =>
      request<{
        success: boolean;
        result: {
          prompt: string;
          reply: string;
          model: string;
          durationMs: number;
          tokensUsed: number;
        };
      }>('/ai/config/test', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }),
    getUsage: () =>
      request<{
        success: boolean;
        scope: string;
        user?: AIUsageInfo;
        platform?: any;
      }>('/ai/usage'),
    listConversations: () =>
      request<{
        success: boolean;
        conversations: Array<{
          sessionId: string;
          lastMessage: string;
          messageCount: number;
          updatedAt: string;
        }>;
      }>('/ai/conversations'),
    getHistory: (sessionId: string) =>
      request<{ success: boolean; conversation?: any; messages?: AIMessage[] }>(
        `/ai/conversations/${sessionId}`
      ),
    deleteConversation: (sessionId: string) =>
      request<{ success: boolean; message: string }>(`/ai/conversations/${sessionId}`, {
        method: 'DELETE',
      }),
  },

  // Subscriptions
  subscriptions: {
    getPlans: () => request<{ success: boolean; plans: SubscriptionPlan[] }>('/subscriptions/plans'),
    getMySubscription: () =>
      request<{ success: boolean; subscription: Subscription }>('/subscriptions/my'),
    upgrade: (planSlug: string) =>
      request<{ success: boolean; message: string; subscription: Subscription }>(
        '/subscriptions/upgrade',
        {
          method: 'POST',
          body: JSON.stringify({ planSlug }),
        }
      ),
    toggleCancel: () =>
      request<{ success: boolean; message: string; subscription: Subscription }>(
        '/subscriptions/cancel',
        { method: 'POST' }
      ),
  },

  // Seller Portal
  seller: {
    apply: (body: { storeName: string; businessType: string; description: string; phone: string }) =>
      request<{ success: boolean; message: string }>('/sellers/apply', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getAnalytics: () => request<{ success: boolean; analytics: any }>('/sellers/analytics'),
    getProducts: () => request<{ success: boolean; products: Product[] }>('/sellers/products'),
    createProduct: (body: any) =>
      request<{ success: boolean; message: string; product: Product }>('/sellers/products', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateProduct: (id: string, body: any) =>
      request<{ success: boolean; message: string; product: Product }>(`/sellers/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    deleteProduct: (id: string) =>
      request<{ success: boolean; message: string }>(`/sellers/products/${id}`, { method: 'DELETE' }),
    getOrders: () => request<{ success: boolean; orders: Order[] }>('/sellers/orders'),
    updateOrderStatus: (orderId: string, status: string, note?: string) =>
      request<{ success: boolean; message: string; order: Order }>(
        `/sellers/orders/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, note }),
        }
      ),
  },

  // Store Customization
  stores: {
    getBySlug: (slug: string) =>
      request<{ success: boolean; store: Store; products: Product[] }>(`/stores/${slug}`),
    getMyStore: () => request<{ success: boolean; store: Store }>('/stores/mine/profile'),
    updateCustomization: (body: Partial<Store>) =>
      request<{ success: boolean; message: string; store: Store }>('/stores/customization', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  // Admin Portal
  admin: {
    getAnalytics: () => request<{ success: boolean; analytics: any }>('/admin/analytics'),
    getUsers: (params?: { role?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; users: User[] }>(`/admin/users?${q}`);
    },
    toggleSuspendUser: (id: string) =>
      request<{ success: boolean; message: string; user: User }>(`/admin/users/${id}/suspend`, {
        method: 'PATCH',
      }),
    getSellerApplications: () =>
      request<{ success: boolean; applications: any[] }>('/admin/seller-applications'),
    reviewSellerApplication: (id: string, action: 'approve' | 'reject', reviewNote?: string) =>
      request<{ success: boolean; message: string }>(`/admin/seller-applications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, reviewNote }),
      }),
    getAllProducts: () => request<{ success: boolean; products: Product[] }>('/admin/products'),
    togglePublish: (id: string) =>
      request<{ success: boolean; message: string; product: Product }>(
        `/admin/products/${id}/publish`,
        { method: 'PATCH' }
      ),
    deleteProduct: (id: string) =>
      request<{ success: boolean; message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),
    getAuditLogs: () => request<{ success: boolean; logs: any[] }>('/admin/audit-logs'),
  },

  // Contact & Newsletter
  contact: {
    submit: (body: { name: string; email: string; subject: string; message: string }) =>
      request<{ success: boolean; message: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    subscribeNewsletter: (email: string) =>
      request<{ success: boolean; message: string }>('/contact/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },
};
