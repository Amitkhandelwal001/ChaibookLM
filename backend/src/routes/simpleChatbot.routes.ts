import { Router } from 'express';
import { chatbotMessage } from '../controllers/simpleChatbot.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);
router.post('/message', chatbotMessage);

export default router;
