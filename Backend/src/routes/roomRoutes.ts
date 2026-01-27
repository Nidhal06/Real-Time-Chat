import { Router } from 'express';
import { createRoom, joinRoom, leaveRoom, listRooms } from '../controllers/roomController';
import { sendRoomInvitations } from '../controllers/invitationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', listRooms);
router.post('/', createRoom);
router.post('/:roomId/invitations', sendRoomInvitations);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);

export default router;
