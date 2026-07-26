import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendar.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();
router.use(protect);

router.get('/', getEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
