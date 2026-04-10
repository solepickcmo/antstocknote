import { Router } from 'express';
import { getStrategyStats, getEmotionStats, getMistakesStats, getNotes } from '../controllers/analysis.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/strategy', getStrategyStats);
router.get('/emotion', getEmotionStats);
router.get('/mistakes', getMistakesStats);
router.get('/notes', getNotes);

export default router;
