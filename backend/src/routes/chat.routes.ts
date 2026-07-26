import express from 'express';
import { sendMessage, getChatHistory, getUserChats } from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', getUserChats);
router.post('/message', sendMessage);
router.get('/:chatId', getChatHistory);

export default router;
