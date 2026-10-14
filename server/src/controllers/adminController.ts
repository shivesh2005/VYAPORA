import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { SellerApplication } from '../models/SellerApplication';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { Subscription } from '../models/Subscription';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

export const getAdminAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalCustomers,
      totalSellers,
      totalProducts,
      totalOrders,
      orders,
      recentUsers,
      pendingApplicationsCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'seller' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(100),
      User.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash'),
      SellerApplication.countDocuments({ status: 'pending' }),
    ]);

    // Calculate platform GMV (Gross Merchandise Value)
    const platformGmv = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Platform volume timeline
    const monthlyGmvMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyGmvMap[key] = 0;
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyGmvMap[key] !== undefined) {
        monthlyGmvMap[key] += o.totalAmount;
      }
    });

    const platformTimeline = Object.entries(monthlyGmvMap).map(([month, gmv]) => ({
      month,
      gmv,
    }));

    res.status(200).json({
      success: true,
      analytics: {
        totalCustomers,
        totalSellers,
        totalProducts,
        totalOrders,
        platformGmv,
        pendingApplicationsCount,
        platformTimeline,
        recentUsers,
        recentOrders: orders.slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, search } = req.query;
    const query: any = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(String(search), 'i') },
        { email: new RegExp(String(search), 'i') },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select('-passwordHash');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const toggleSuspendUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ success: false, message: 'Cannot suspend admin accounts.' });
      return;
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    await AuditLog.create({
      adminId: req.user!._id,
      action: user.isSuspended ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      targetType: 'User',
      targetId: user._id.toString(),
      details: `${req.user!.name} ${user.isSuspended ? 'suspended' : 'reactivated'} account ${user.email}`,
    });

    res.status(200).json({
      success: true,
      message: user.isSuspended ? 'User has been suspended.' : 'User has been reactivated.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerApplications = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applications = await SellerApplication.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email avatar createdAt');

    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

export const reviewSellerApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, reviewNote } = req.body; // 'approve' | 'reject'

    const application = await SellerApplication.findById(id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    if (action === 'approve') {
      application.status = 'approved';
      application.reviewNote = reviewNote || 'Approved by administrator.';
      await application.save();

      // Upgrade user to seller
      const user = await User.findById(application.userId);
      if (user) {
        user.role = 'seller';
        await user.save();

        // Create store if not exists
        let store = await Store.findOne({ sellerId: user._id });
        if (!store) {
          const baseSlug = application.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
          store = await Store.create({
            sellerId: user._id,
            storeName: application.storeName,
            slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
            description: application.description,
            contactPhone: application.phone,
            isApproved: true,
          });
        }

        // Initialize Starter subscription
        const starterPlan = await SubscriptionPlan.findOne({ name: 'STARTER' });
        if (starterPlan) {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          await Subscription.findOneAndUpdate(
            { sellerId: user._id },
            {
              sellerId: user._id,
              storeId: store._id,
              planId: starterPlan._id,
              status: 'active',
              currentPeriodEnd: nextMonth,
            },
            { upsert: true }
          );
        }
      }
    } else {
      application.status = 'rejected';
      application.reviewNote = reviewNote || 'Application did not meet merchant criteria.';
      await application.save();
    }

    await AuditLog.create({
      adminId: req.user!._id,
      action: action === 'approve' ? 'APPROVE_SELLER' : 'REJECT_SELLER',
      targetType: 'SellerApplication',
      targetId: application._id.toString(),
      details: `${req.user!.name} ${action}d seller application for "${application.storeName}"`,
    });

    res.status(200).json({
      success: true,
      message: `Seller application ${action === 'approve' ? 'approved' : 'rejected'}.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProductsAdmin = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('sellerId', 'name email')
      .populate('storeId', 'storeName');

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const toggleProductPublish = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    product.isPublished = !product.isPublished;
    await product.save();

    await AuditLog.create({
      adminId: req.user!._id,
      action: product.isPublished ? 'PUBLISH_PRODUCT' : 'UNPUBLISH_PRODUCT',
      targetType: 'Product',
      targetId: product._id.toString(),
      details: `${req.user!.name} ${product.isPublished ? 'published' : 'unpublished'} product "${product.title}"`,
    });

    res.status(200).json({
      success: true,
      message: product.isPublished ? 'Product is now live.' : 'Product has been unpublished.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await AuditLog.create({
      adminId: req.user!._id,
      action: 'DELETE_PRODUCT',
      targetType: 'Product',
      targetId: id,
      details: `${req.user!.name} deleted product "${product.title}"`,
    });

    res.status(200).json({ success: true, message: 'Product deleted from platform.' });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('adminId', 'name email');

    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
