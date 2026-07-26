import { Router } from 'express';
import { registerHandler, loginHandler, getMeHandler } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', protect, getMeHandler);

export default router;
