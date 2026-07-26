import express from 'express';
import { handleChat } from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // Ensure all chat routes are protected

router.post('/', handleChat);

export default router;
