import { Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../middleware/auth';

const populateCartDetails = async (cart: any) => {
  await cart.populate({
    path: 'items.productId',
    select: 'title slug images price compareAtPrice stock brand sellerId storeId',
    populate: { path: 'storeId', select: 'storeName' },
  });

  let subtotal = 0;
  const validItems = [];

  for (const item of cart.items) {
    if (item.productId) {
      const prod = item.productId as any;
      const currentPrice = prod.price;
      subtotal += currentPrice * item.quantity;
      validItems.push(item);
    }
  }

  // Check coupon validity and recalculate discount
  let discountAmount = 0;
  if (cart.appliedCoupon) {
    const coupon = await Coupon.findOne({ code: cart.appliedCoupon, isActive: true });
    if (coupon && coupon.expiresAt > new Date() && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      }
    } else {
      cart.appliedCoupon = '';
    }
  }

  cart.discountAmount = Math.round(discountAmount);
  // Free shipping if subtotal >= 999, else 99
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - cart.discountAmount + shippingFee);

  return {
    cart,
    items: validItems,
    summary: {
      subtotal,
      discountAmount: cart.discountAmount,
      appliedCoupon: cart.appliedCoupon,
      shippingFee,
      total,
      freeShippingThreshold: 999,
      amountNeededForFreeShipping: Math.max(0, 999 - subtotal),
    },
  };
};

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user!._id, items: [] });
    }

    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, ...cartData });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity = 1, selectedVariant } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isPublished) {
      res.status(404).json({ success: false, message: 'Product is unavailable.' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: `Only ${product.stock} units currently available in stock.` });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart) {
      cart = new Cart({ userId: req.user!._id, items: [] });
    }

    // Check if product with same variant already in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.selectedVariant || {}) === JSON.stringify(selectedVariant || {})
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${cart.items[existingIndex].quantity} in cart and max stock is ${product.stock}.`,
        });
        return;
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        productId: product._id as any,
        quantity,
        selectedVariant,
        priceAtAddition: product.price,
      });
    }

    await cart.save();
    const cartData = await populateCartDetails(cart);

    res.status(200).json({ success: true, message: 'Added to cart.', ...cartData });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    const item = cart.items.find((i: any) => i._id.toString() === itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found in cart.' });
      return;
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);
    } else {
      const product = await Product.findById(item.productId);
      if (product && quantity > product.stock) {
        res.status(400).json({ success: false, message: `Stock limit reached: only ${product.stock} available.` });
        return;
      }
      item.quantity = quantity;
    }

    await cart.save();
    const cartData = await populateCartDetails(cart);

    res.status(200).json({ success: true, ...cartData });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);
    await cart.save();

    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, message: 'Item removed from cart.', ...cartData });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
      return;
    }

    if (new Date() > coupon.expiresAt) {
      res.status(400).json({ success: false, message: 'This coupon has expired.' });
      return;
    }

    const cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty.' });
      return;
    }

    cart.appliedCoupon = coupon.code;
    await cart.save();

    const cartData = await populateCartDetails(cart);
    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully!`,
      ...cartData,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ userId: req.user!._id });
    if (cart) {
      cart.appliedCoupon = '';
      cart.discountAmount = 0;
      await cart.save();
    }
    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, message: 'Coupon removed.', ...cartData });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ userId: req.user!._id });
    if (cart) {
      cart.items = [];
      cart.appliedCoupon = '';
      cart.discountAmount = 0;
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};
