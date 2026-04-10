import { Router } from 'express';
import { withdrawAccount } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.delete('/withdraw', authenticateJWT, withdrawAccount);

export default router;
