import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { CatalogSearchService } from '../services/catalog-search.service';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort = 'newest',
      page = '1',
      limit = '12',
      storeId,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Use unified intelligent catalog search pipeline when query keywords exist
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchResult = await CatalogSearchService.executeSearch({
        query: search.trim(),
        category: category && category !== 'All' ? String(category) : undefined,
        subcategory: subcategory ? String(subcategory) : undefined,
        brand: brand ? String(brand) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStockOnly: inStock === 'true',
        sort: sort ? String(sort) : 'newest',
        limit: limitNum,
        skip,
      });

      const totalCount = searchResult.totalMatches;
      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        products: searchResult.products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalProducts: totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        searchMeta: {
          hasMatches: searchResult.hasMatches,
          noMatchesReason: searchResult.noMatchesReason,
          suggestedBroadening: searchResult.suggestedBroadening,
          appliedConstraints: searchResult.appliedConstraints,
        },
      });
      return;
    }

    const query: any = { isPublished: true };

    if (category && typeof category === 'string' && category !== 'All') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (subcategory && typeof subcategory === 'string') {
      query.subcategory = new RegExp(`^${subcategory}$`, 'i');
    }

    if (brand && typeof brand === 'string') {
      query.brand = new RegExp(`^${brand}$`, 'i');
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (storeId) {
      query.storeId = storeId;
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1, numReviews: -1 };
    else if (sort === 'popular') sortOption = { numReviews: -1, rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('storeId', 'storeName slug brandAccentColor')
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalProducts: totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugOrId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idStr = String(req.params.identifier);
    let product;

    if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idStr)
        .populate('sellerId', 'name email avatar')
        .populate('storeId', 'storeName slug logoUrl brandAccentColor');
    }

    if (!product) {
      product = await Product.findOne({ slug: idStr })
        .populate('sellerId', 'name email avatar')
        .populate('storeId', 'storeName slug logoUrl brandAccentColor');
    }


    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const current = await Product.findById(id);
    if (!current) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const related = await Product.find({
      _id: { $ne: current._id },
      category: current.category,
      isPublished: true,
    })
      .limit(4)
      .lean();

    res.status(200).json({ success: true, products: related });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [featured, bestsellers, newArrivals] = await Promise.all([
      Product.find({ isPublished: true, isFeatured: true }).limit(8).lean(),
      Product.find({ isPublished: true }).sort({ rating: -1, numReviews: -1 }).limit(8).lean(),
      Product.find({ isPublished: true }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    res.status(200).json({
      success: true,
      featured,
      bestsellers,
      newArrivals,
    });
  } catch (error) {
    next(error);
  }
};
