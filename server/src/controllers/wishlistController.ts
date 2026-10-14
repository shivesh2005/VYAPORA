import { Response, NextFunction } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user!._id }).populate({
      path: 'products',
      select: 'title slug images price compareAtPrice discountBadge rating numReviews stock brand',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user!._id, products: [] });
    }

    res.status(200).json({ success: true, wishlist: wishlist.products });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId: req.user!._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user!._id, products: [] });
    }

    const existsIndex = wishlist.products.findIndex((p) => p.toString() === productId);
    let action = 'added';

    if (existsIndex > -1) {
      wishlist.products.splice(existsIndex, 1);
      action = 'removed';
    } else {
      wishlist.products.push(product._id as any);
      action = 'added';
    }

    await wishlist.save();
    await wishlist.populate({
      path: 'products',
      select: 'title slug images price compareAtPrice discountBadge rating numReviews stock brand',
    });

    res.status(200).json({
      success: true,
      message: action === 'added' ? 'Added to wishlist.' : 'Removed from wishlist.',
      action,
      wishlist: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};
