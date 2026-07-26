import express from 'express';
import { handleChat, fetchUserChats, fetchChatTree } from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', handleChat);
router.get('/history', fetchUserChats);
router.get('/:chatId', fetchChatTree);

export default router;
