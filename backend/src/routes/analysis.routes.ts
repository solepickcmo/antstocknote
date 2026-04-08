import { Router } from 'express';
import { getStrategyStats, getEmotionStats, getMistakesStats } from '../controllers/analysis.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/strategy', getStrategyStats);
router.get('/emotion', getEmotionStats);
router.get('/mistakes', getMistakesStats);

export default router;
