import { Router } from 'express';
import {
  getSubscriptionPlans,
  getMySubscription,
  upgradeSubscription,
  toggleCancelSubscription,
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/plans', getSubscriptionPlans);

router.use(authenticate, requireRole(['seller', 'admin']));
router.get('/my', getMySubscription);
router.post('/upgrade', upgradeSubscription);
router.post('/cancel', toggleCancelSubscription);

export default router;
