import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find().sort({ itemCount: -1, name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const products = await Product.find({
      category: new RegExp(`^${category.name}$`, 'i'),
      isPublished: true,
    }).limit(12);

    res.status(200).json({ success: true, category, products });
  } catch (error) {
    next(error);
  }
};
