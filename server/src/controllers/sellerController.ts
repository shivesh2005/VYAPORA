import { Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Order, OrderStatus } from '../models/Order';
import { Store } from '../models/Store';
import { Subscription } from '../models/Subscription';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { SellerApplication } from '../models/SellerApplication';
import { AuthRequest } from '../middleware/auth';

// Apply to become a seller
export const applyToBeSeller = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { storeName, businessType, description, phone } = req.body;

    const existingApplication = await SellerApplication.findOne({ userId: req.user!._id, status: 'pending' });
    if (existingApplication) {
      res.status(400).json({ success: false, message: 'You already have a pending seller application under review.' });
      return;
    }

    const application = await SellerApplication.create({
      userId: req.user!._id,
      storeName,
      businessType,
      description,
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'Seller application submitted successfully. Administrator will review it.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// Seller Dashboard Analytics
export const getSellerAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user!._id;

    // Fetch seller store
    const store = await Store.findOne({ sellerId });

    // Fetch orders containing this seller's products
    const orders = await Order.find({ sellerIds: sellerId }).sort({ createdAt: -1 });

    let totalSales = 0;
    let sellerOrderCount = orders.length;

    // Calculate revenue from seller's items only
    const monthlyRevenueMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Pre-populate past 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyRevenueMap[key] = 0;
    }

    orders.forEach((order) => {
      let orderSellerRevenue = 0;
      order.items.forEach((item) => {
        if (item.sellerId.toString() === sellerId.toString()) {
          const itemRev = item.price * item.quantity;
          orderSellerRevenue += itemRev;
          totalSales += itemRev;
        }
      });

      const d = new Date(order.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyRevenueMap[key] !== undefined) {
        monthlyRevenueMap[key] += orderSellerRevenue;
      }
    });

    const averageOrderValue = sellerOrderCount > 0 ? Math.round(totalSales / sellerOrderCount) : 0;

    // Products breakdown
    const products = await Product.find({ sellerId });
    const lowStockProducts = products.filter((p) => p.stock < 10);

    // Top selling products
    const topProducts = [...products]
      .sort((a, b) => b.numReviews * b.rating - a.numReviews * a.rating)
      .slice(0, 5);

    // Subscription & Usage
    let subscription = await Subscription.findOne({ sellerId }).populate('planId');
    if (!subscription) {
      // Default to Starter
      const starterPlan = await SubscriptionPlan.findOne({ name: 'STARTER' });
      if (starterPlan) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        subscription = await Subscription.create({
          sellerId,
          storeId: store?._id,
          planId: starterPlan._id,
          status: 'active',
          currentPeriodEnd: nextMonth,
          usage: { productsCount: products.length, aiRequestsThisMonth: 8 },
        });
        await subscription.populate('planId');
      }
    } else {
      subscription.usage.productsCount = products.length;
      await subscription.save();
    }

    const revenueTimeline = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    res.status(200).json({
      success: true,
      analytics: {
        totalSales,
        totalOrders: sellerOrderCount,
        averageOrderValue,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        revenueTimeline,
        topProducts,
        lowStockProducts,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Seller Product CRUD with Subscription Entitlement Enforcement
export const getSellerProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find({ sellerId: req.user!._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const createSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user!._id;

    // Check SaaS subscription limit!
    const subscription = await Subscription.findOne({ sellerId }).populate('planId');
    const plan = subscription?.planId as any;

    const currentCount = await Product.countDocuments({ sellerId });
    const maxAllowed = plan?.limits?.maxProducts || 10;

    if (currentCount >= maxAllowed) {
      res.status(403).json({
        success: false,
        message: `Plan limit reached: Your ${plan?.name || 'STARTER'} plan permits a maximum of ${maxAllowed} products. Please upgrade to GROWTH or SCALE to list more products.`,
      });
      return;
    }

    const store = await Store.findOne({ sellerId });
    const { title, description, brand, category, subcategory, images, price, compareAtPrice, discountBadge, sku, stock, variants, tags, isPublished } = req.body;

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      title,
      slug,
      description,
      brand,
      category,
      subcategory,
      images,
      price,
      compareAtPrice,
      discountBadge,
      sku: sku.toUpperCase(),
      stock,
      variants: variants || [],
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      sellerId,
      storeId: store?._id,
    });

    // Update usage count
    if (subscription) {
      subscription.usage.productsCount = currentCount + 1;
      await subscription.save();
    }

    res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (error) {
    next(error);
  }
};

export const updateSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const sellerId = req.user!._id;

    // Ensure ownership
    const product = await Product.findOne({ _id: id, sellerId });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });
      return;
    }

    Object.assign(product, req.body);
    await product.save();

    res.status(200).json({ success: true, message: 'Product updated successfully.', product });
  } catch (error) {
    next(error);
  }
};

export const deleteSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const sellerId = req.user!._id;

    const product = await Product.findOneAndDelete({ _id: id, sellerId });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });
      return;
    }

    // Decrement subscription usage
    await Subscription.findOneAndUpdate(
      { sellerId },
      { $inc: { 'usage.productsCount': -1 } }
    );

    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Seller Orders
export const getSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find({ sellerIds: req.user!._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusBySeller = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const allowedTransitions: Record<string, string[]> = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    };

    const order = await Order.findOne({ _id: orderId, sellerIds: req.user!._id });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
      return;
    }

    const current = order.orderStatus;
    if (!allowedTransitions[current]?.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid order status transition from "${current}" to "${status}". Allowed transitions: [${allowedTransitions[current]?.join(', ')}]`,
      });
      return;
    }

    order.orderStatus = status as OrderStatus;
    order.statusHistory.push({
      status: status as OrderStatus,
      timestamp: new Date(),
      note: note || `Order status updated to ${status} by seller.`,
    });

    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (error) {
    next(error);
  }
};
