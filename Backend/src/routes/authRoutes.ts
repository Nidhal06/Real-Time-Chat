import { Router } from 'express';
import { me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, me);

export default router;
