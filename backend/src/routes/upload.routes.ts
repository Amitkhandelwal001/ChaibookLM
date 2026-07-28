import { Router } from 'express';
import { uploadFileHandler, getDocumentsHandler, deleteDocumentHandler, viewDocumentHandler } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// View route allows token as query param (for browser window.open)
router.get('/view/:id', viewDocumentHandler);

// Protect all other upload routes
router.use(protect);

router.post('/', uploadMiddleware.single('file'), uploadFileHandler);
router.get('/', getDocumentsHandler);
router.delete('/:id', deleteDocumentHandler);

export default router;
