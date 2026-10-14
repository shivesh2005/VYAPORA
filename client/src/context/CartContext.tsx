import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, CartSummary, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  itemCount: number;
  loading: boolean;
  wishlist: Product[];
  wishlistCount: number;
  addToCart: (productId: string, quantity?: number, selectedVariant?: any) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  reloadCart: () => Promise<void>;
}

const defaultSummary: CartSummary = {
  subtotal: 0,
  discountAmount: 0,
  shippingFee: 0,
  total: 0,
  freeShippingThreshold: 999,
  amountNeededForFreeShipping: 999,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const reloadCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSummary(defaultSummary);
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const [cartRes, wishRes] = await Promise.all([
        api.cart.get().catch(() => null),
        api.wishlist.get().catch(() => null),
      ]);

      if (cartRes?.success) {
        setItems(cartRes.items || []);
        setSummary(cartRes.summary || defaultSummary);
      }
      if (wishRes?.success) {
        setWishlist(wishRes.wishlist || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reloadCart();
  }, [reloadCart]);

  const addToCart = async (productId: string, quantity = 1, selectedVariant?: any): Promise<boolean> => {
    if (!user) {
      showToast('Please log in to add items to your cart.', 'info');
      return false;
    }
    try {
      const res = await api.cart.add({ productId, quantity, selectedVariant });
      if (res.success) {
        setItems(res.items || []);
        setSummary(res.summary || defaultSummary);
        showToast(res.message || 'Item added to your cart!', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to cart.', 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.cart.updateQuantity(itemId, quantity);
      if (res.success) {
        setItems(res.items || []);
        setSummary(res.summary || defaultSummary);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not update quantity.', 'error');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await api.cart.remove(itemId);
      if (res.success) {
        setItems(res.items || []);
        setSummary(res.summary || defaultSummary);
        showToast('Item removed from cart.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not remove item.', 'error');
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.cart.applyCoupon(code);
      if (res.success) {
        setItems(res.items || []);
        setSummary(res.summary || defaultSummary);
        showToast(res.message || 'Coupon applied successfully!', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Invalid coupon code.', 'error');
      return false;
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await api.cart.removeCoupon();
      if (res.success) {
        setItems(res.items || []);
        setSummary(res.summary || defaultSummary);
        showToast('Coupon removed.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove coupon.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.cart.clear();
      setItems([]);
      setSummary(defaultSummary);
    } catch {
      // Ignore
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      showToast('Please log in to manage your wishlist.', 'info');
      return;
    }
    try {
      const res = await api.wishlist.toggle(productId);
      if (res.success) {
        setWishlist(res.wishlist || []);
        showToast(res.message, res.action === 'added' ? 'success' : 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update wishlist.', 'error');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => (typeof p === 'string' ? p === productId : p._id === productId));
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        itemCount,
        loading,
        wishlist,
        wishlistCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
        toggleWishlist,
        isInWishlist,
        reloadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
