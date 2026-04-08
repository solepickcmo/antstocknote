import { Router } from 'express';
import { createTrade, getTrades, getCalendar } from '../controllers/trade.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.post('/', createTrade);
router.get('/', getTrades);
router.get('/calendar', getCalendar);

export default router;
