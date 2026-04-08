import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/summary', getDashboardSummary);

export default router;
