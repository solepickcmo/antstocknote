import { Router } from 'express';
import { getTags, createTag, deleteTag } from '../controllers/tag.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getTags);
router.post('/', createTag);
router.delete('/:id', deleteTag);

export default router;
