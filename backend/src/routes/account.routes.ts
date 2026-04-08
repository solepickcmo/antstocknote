import { Router } from 'express';
import { createAccount, getAccounts, updateAccount, deleteAccount } from '../controllers/account.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createAccount);
router.get('/', getAccounts);
router.patch('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
