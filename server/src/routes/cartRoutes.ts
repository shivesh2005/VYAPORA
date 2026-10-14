import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/items/:itemId', updateCartItemQuantity);
router.delete('/items/:itemId', removeFromCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.delete('/clear', clearCart);

export default router;
