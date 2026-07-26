import { Router } from 'express';
import { generateHighlightsHandler } from '../controllers/video.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect video routes
router.use(authMiddleware);

router.post('/highlights', generateHighlightsHandler);

export default router;
