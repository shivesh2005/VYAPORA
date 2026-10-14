import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';

export const validateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid coupon code.' });
      return;
    }

    if (new Date() > coupon.expiresAt) {
      res.status(400).json({ success: false, message: 'This coupon has expired.' });
      return;
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
      return;
    }

    if (orderAmount < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue.toLocaleString('en-IN')}`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, orderAmount);
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid.',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: Math.round(discount),
      },
    });
  } catch (error) {
    next(error);
  }
};
