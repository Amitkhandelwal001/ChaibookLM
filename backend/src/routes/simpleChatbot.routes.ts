import { Router } from 'express';
import {
  chatbotMessage,
  getUserChats,
  getChatMessages,
  deleteChat,
} from '../controllers/simpleChatbot.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/message', chatbotMessage);
router.get('/chats', getUserChats);
router.get('/chats/:chatId', getChatMessages);
router.delete('/chats/:chatId', deleteChat);

export default router;
