import express from 'express';
import { saveWhiteboardHandler, getWhiteboardHandler, listWhiteboardsHandler } from '../controllers/whiteboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', listWhiteboardsHandler);
router.get('/:id', getWhiteboardHandler);
router.post('/', saveWhiteboardHandler);

export default router;
