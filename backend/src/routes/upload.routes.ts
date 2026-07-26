import { Router } from 'express';
import { uploadFileHandler, getDocumentsHandler } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Protect all upload routes
router.use(protect);

router.post('/', uploadMiddleware.single('file'), uploadFileHandler);
router.get('/', getDocumentsHandler);

export default router;
