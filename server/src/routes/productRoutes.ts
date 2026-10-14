import { Router } from 'express';
import {
  getProducts,
  getProductBySlugOrId,
  getRelatedProducts,
  getFeaturedProducts,
} from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:identifier', getProductBySlugOrId);
router.get('/:id/related', getRelatedProducts);

export default router;
