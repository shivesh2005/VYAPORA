import { Router } from 'express';
import {
  getStoreBySlug,
  getMyStore,
  updateStoreCustomization,
} from '../controllers/storeController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateStoreSchema } from '../validators/storeValidator';

const router = Router();

// Seller customization
router.get('/mine/profile', authenticate, requireRole(['seller', 'admin']), getMyStore);
router.put(
  '/customization',
  authenticate,
  requireRole(['seller', 'admin']),
  validate(updateStoreSchema),
  updateStoreCustomization
);

// Public storefront view
router.get('/:slug', getStoreBySlug);

export default router;
