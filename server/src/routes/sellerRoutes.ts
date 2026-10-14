import { Router } from 'express';
import {
  applyToBeSeller,
  getSellerAnalytics,
  getSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateOrderStatusBySeller,
} from '../controllers/sellerController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/productValidator';

const router = Router();

router.use(authenticate);

// Public application to become seller
router.post('/apply', applyToBeSeller);

// Seller role protected endpoints
router.use(requireRole(['seller', 'admin']));

router.get('/analytics', getSellerAnalytics);
router.get('/products', getSellerProducts);
router.post('/products', validate(createProductSchema), createSellerProduct);
router.put('/products/:id', validate(updateProductSchema), updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);
router.get('/orders', getSellerOrders);
router.patch('/orders/:orderId/status', updateOrderStatusBySeller);

export default router;
