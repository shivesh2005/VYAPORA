import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import orderRoutes from './orderRoutes';
import reviewRoutes from './reviewRoutes';
import couponRoutes from './couponRoutes';
import sellerRoutes from './sellerRoutes';
import storeRoutes from './storeRoutes';
import adminRoutes from './adminRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import aiRoutes from './aiRoutes';
import contactRoutes from './contactRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'VYAPORA (NEXORA Engine) Multi-Vendor API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/sellers', sellerRoutes);
router.use('/stores', storeRoutes);
router.use('/admin', adminRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/ai', aiRoutes);
router.use('/contact', contactRoutes);

export default router;
