import { Router } from 'express';
import {
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../validators/authValidator';

const router = Router();

router.use(authenticate);

router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);
router.patch('/addresses/:id/default', setDefaultAddress);

export default router;
