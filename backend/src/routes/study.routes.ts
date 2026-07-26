import express from 'express';
import { generateMaterials, fetchStudyData } from '../controllers/study.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/generate', generateMaterials);
router.get('/:documentId', fetchStudyData);

export default router;
