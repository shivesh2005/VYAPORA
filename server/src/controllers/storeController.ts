import { Request, Response, NextFunction } from 'express';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getStoreBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const store = await Store.findOne({ slug, isApproved: true });
    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found.' });
      return;
    }

    const products = await Product.find({ storeId: store._id, isPublished: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      store,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyStore = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const store = await Store.findOne({ sellerId: req.user!._id });
    if (!store) {
      res.status(404).json({ success: false, message: 'Store profile not found.' });
      return;
    }
    res.status(200).json({ success: true, store });
  } catch (error) {
    next(error);
  }
};

export const updateStoreCustomization = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let store = await Store.findOne({ sellerId: req.user!._id });
    if (!store) {
      const baseSlug = req.user!.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      store = new Store({
        sellerId: req.user!._id,
        storeName: `${req.user!.name}'s Store`,
        slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
      });
    }

    const {
      storeName,
      description,
      logoUrl,
      bannerUrl,
      brandAccentColor,
      contactEmail,
      contactPhone,
      layoutSettings,
    } = req.body;

    if (storeName) store.storeName = storeName;
    if (description !== undefined) store.description = description;
    if (logoUrl !== undefined) store.logoUrl = logoUrl;
    if (bannerUrl !== undefined) store.bannerUrl = bannerUrl;
    if (brandAccentColor) store.brandAccentColor = brandAccentColor;
    if (contactEmail !== undefined) store.contactEmail = contactEmail;
    if (contactPhone !== undefined) store.contactPhone = contactPhone;
    if (layoutSettings) {
      store.layoutSettings = {
        ...store.layoutSettings,
        ...layoutSettings,
      };
    }

    await store.save();

    res.status(200).json({
      success: true,
      message: 'Storefront customization saved successfully.',
      store,
    });
  } catch (error) {
    next(error);
  }
};
