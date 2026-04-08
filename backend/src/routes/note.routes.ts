import { Router } from 'express';
import { upsertNote, getNote } from '../controllers/note.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.post('/:tradeId', upsertNote);
router.get('/:tradeId', getNote);

export default router;
