import { Router } from 'express';
import {
  getAdminAnalytics,
  getAllUsers,
  toggleSuspendUser,
  getSellerApplications,
  reviewSellerApplication,
  getAllProductsAdmin,
  toggleProductPublish,
  deleteProductAdmin,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, requireRole(['admin']));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.patch('/users/:id/suspend', toggleSuspendUser);
router.get('/seller-applications', getSellerApplications);
router.post('/seller-applications/:id/review', reviewSellerApplication);
router.get('/products', getAllProductsAdmin);
router.patch('/products/:id/publish', toggleProductPublish);
router.delete('/products/:id', deleteProductAdmin);
router.get('/audit-logs', getAuditLogs);

export default router;
