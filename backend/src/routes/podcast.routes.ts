import express from 'express';
import { generatePodcast, fetchPodcasts } from '../controllers/podcast.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/generate', generatePodcast);
router.get('/', fetchPodcasts);

export default router;
