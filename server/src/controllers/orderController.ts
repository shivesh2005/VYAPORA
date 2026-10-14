import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { Store } from '../models/Store';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shippingAddress, paymentMethod = 'demo_card', couponCode } = req.body;

    // Fetch user's cart
    const cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty. Please add items before checking out.' });
      return;
    }

    // Server-side inventory & price verification
    const orderItems: any[] = [];
    const storeIdsSet = new Set<string>();
    const sellerIdsSet = new Set<string>();
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isPublished) {
        res.status(400).json({ success: false, message: `Product is no longer available.` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        title: product.title,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
        variant: item.selectedVariant,
        sellerId: product.sellerId,
        storeId: product.storeId,
      });

      if (product.storeId) storeIdsSet.add(product.storeId.toString());
      if (product.sellerId) sellerIdsSet.add(product.sellerId.toString());
    }

    // Coupon calculation
    let discount = 0;
    const effectiveCoupon = couponCode || cart.appliedCoupon;
    if (effectiveCoupon) {
      const coupon = await Coupon.findOne({ code: effectiveCoupon.toUpperCase().trim(), isActive: true });
      if (coupon && coupon.expiresAt > new Date() && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        // Increment usage count
        coupon.usageCount += 1;
        await coupon.save();
      }
    }

    discount = Math.round(discount);
    const shippingFee = subtotal >= 999 ? 0 : 99;
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    // Decrement stock atomically for each ordered product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
      if (item.storeId) {
        await Store.findByIdAndUpdate(item.storeId, {
          $inc: { totalSales: item.price * item.quantity },
        });
      }
    }

    // Generate readable orderNumber
    const orderNumber = `NEX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await Order.create({
      orderNumber,
      customerId: req.user!._id,
      items: orderItems,
      storeIds: Array.from(storeIdsSet).map((id) => new mongoose.Types.ObjectId(id)),
      sellerIds: Array.from(sellerIdsSet).map((id) => new mongoose.Types.ObjectId(id)),
      shippingAddress,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'demo_paid',
      paymentMethod,
      orderStatus: 'Confirmed',
      subtotal,
      discount,
      couponCode: effectiveCoupon,
      shippingFee,
      totalAmount,
      trackingNumber: `TRK-NX${Math.floor(10000000 + Math.random() * 90000000)}`,
      statusHistory: [
        {
          status: 'Confirmed',
          timestamp: new Date(),
          note: 'Order placed and sandbox payment verified successfully.',
        },
      ],
    });

    // Clear cart after successful order creation
    cart.items = [];
    cart.appliedCoupon = '';
    cart.discountAmount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find({ customerId: req.user!._id })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'slug')
      .lean();

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const query: any = { _id: id };
    // If not admin, must be customer or seller who owns items in this order
    if (req.user!.role === 'customer') {
      query.customerId = req.user!._id;
    } else if (req.user!.role === 'seller') {
      query.sellerIds = req.user!._id;
    }

    const order = await Order.findOne(query)
      .populate('items.productId', 'slug title images brand')
      .populate('storeIds', 'storeName slug');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const order = await Order.findOne({ _id: id, customerId: req.user!._id });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}.`,
      });
      return;
    }

    if (order.orderStatus === 'Cancelled') {
      res.status(400).json({ success: false, message: 'Order is already cancelled.' });
      return;
    }

    // Replenish stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Inventory restored.',
      order,
    });
  } catch (error) {
    next(error);
  }
};
