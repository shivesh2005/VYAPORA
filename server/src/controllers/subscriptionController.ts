import { Response, NextFunction } from 'express';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { Subscription } from '../models/Subscription';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getSubscriptionPlans = async (_req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    next(error);
  }
};

export const getMySubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    let subscription = await Subscription.findOne({ sellerId }).populate('planId');

    // If seller does not have one, initialize STARTER
    if (!subscription) {
      const starterPlan = await SubscriptionPlan.findOne({ name: 'STARTER' });
      if (starterPlan) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const store = await Store.findOne({ sellerId });
        const productCount = await Product.countDocuments({ sellerId });

        subscription = await Subscription.create({
          sellerId,
          storeId: store?._id,
          planId: starterPlan._id,
          status: 'active',
          currentPeriodEnd: nextMonth,
          usage: { productsCount: productCount, aiRequestsThisMonth: 0 },
        });
        await subscription.populate('planId');
      }
    } else {
      // Sync actual product count
      const productCount = await Product.countDocuments({ sellerId });
      subscription.usage.productsCount = productCount;
      await subscription.save();
    }

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

export const upgradeSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { planSlug } = req.body;
    const sellerId = req.user!._id;

    const targetPlan = await SubscriptionPlan.findOne({ slug: planSlug.toLowerCase() });
    if (!targetPlan) {
      res.status(404).json({ success: false, message: 'Requested subscription plan not found.' });
      return;
    }

    let subscription = await Subscription.findOne({ sellerId });
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const productCount = await Product.countDocuments({ sellerId });

    if (subscription) {
      subscription.planId = targetPlan._id as any;
      subscription.status = 'active';
      subscription.currentPeriodEnd = nextMonth;
      subscription.cancelAtPeriodEnd = false;
      subscription.usage.productsCount = productCount;
      await subscription.save();
      await subscription.populate('planId');
    } else {
      const store = await Store.findOne({ sellerId });
      subscription = await Subscription.create({
        sellerId,
        storeId: store?._id,
        planId: targetPlan._id,
        status: 'active',
        currentPeriodEnd: nextMonth,
        usage: { productsCount: productCount, aiRequestsThisMonth: 0 },
      });
      await subscription.populate('planId');
    }

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to the ${targetPlan.name} plan (Demo Simulation).`,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    const subscription = await Subscription.findOne({ sellerId }).populate('planId');
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found.' });
      return;
    }

    subscription.cancelAtPeriodEnd = !subscription.cancelAtPeriodEnd;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: subscription.cancelAtPeriodEnd
        ? 'Subscription will cancel at the end of the current billing cycle.'
        : 'Subscription renewal has been resumed.',
      subscription,
    });
  } catch (error) {
    next(error);
  }
};
