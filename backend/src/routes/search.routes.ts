import express from 'express';
import { globalSearch, getKnowledgeGraph } from '../controllers/search.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', globalSearch);
router.get('/graph', getKnowledgeGraph);

export default router;
