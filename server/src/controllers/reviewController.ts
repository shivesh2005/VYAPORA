import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';

export const getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ productId, customerId: req.user!._id });
    if (existing) {
      res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
      return;
    }

    // Check if customer purchased this product
    const hasPurchased = await Order.exists({
      customerId: req.user!._id,
      'items.productId': product._id,
    });

    const review = await Review.create({
      productId: product._id,
      customerId: req.user!._id,
      customerName: req.user!.name,
      rating: Number(rating),
      title,
      comment,
      verifiedPurchase: Boolean(hasPurchased),
    });

    // Recalculate product rating
    const allReviews = await Review.find({ productId: product._id, isApproved: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = Math.round(avgRating * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();

    res.status(201).json({ success: true, message: 'Review submitted successfully.', review });
  } catch (error) {
    next(error);
  }
};
