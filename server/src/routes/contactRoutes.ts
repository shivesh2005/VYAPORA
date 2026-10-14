import { Router } from 'express';
import { submitContact, subscribeNewsletter, getContactMessagesAdmin } from '../controllers/contactController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { contactMessageSchema, newsletterSchema } from '../validators/storeValidator';

const router = Router();

router.post('/', validate(contactMessageSchema), submitContact);
router.post('/newsletter', validate(newsletterSchema), subscribeNewsletter);
router.get('/', authenticate, requireRole(['admin']), getContactMessagesAdmin);

export default router;
