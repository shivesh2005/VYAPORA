import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
