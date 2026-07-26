import { Router } from 'express';
import { generateHighlightsHandler } from '../controllers/video.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect video routes
router.use(protect);

router.post('/highlights', generateHighlightsHandler);

export default router;
