import { Router } from 'express';
import { getRoomMessages, sendMessage } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/:roomId', getRoomMessages);
router.post('/:roomId', sendMessage);

export default router;
