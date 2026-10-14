import { Router } from 'express';
import { getProductReviews, createProductReview } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', authenticate, createProductReview);

export default router;
