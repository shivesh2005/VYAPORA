import { Router } from 'express';
import { validateCoupon } from '../controllers/couponController';

const router = Router();

router.post('/validate', validateCoupon);

export default router;
