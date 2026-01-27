import { Router } from 'express';
import { acceptInvitation, getInvitation } from '../controllers/invitationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:token', getInvitation);
router.post('/:token/accept', authenticate, acceptInvitation);

export default router;
