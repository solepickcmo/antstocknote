import { Request, Response } from 'express';
import { accountService } from '../services/account.service';

export const createAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const account = await accountService.createAccount(userId, req.body);
    // 빅인트를 문자열로 변환하여 응답
    res.status(201).json({ ...account, id: account.id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const accounts = await accountService.getAccounts(userId);
    res.status(200).json({ accounts: accounts.map(a => ({ ...a, id: a.id.toString() })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const accountId = BigInt(req.params.id as string);
    const account = await accountService.updateAccount(userId, accountId, req.body);
    res.status(200).json({ ...account, id: account.id.toString() });
  } catch (error: any) {
    if (error.message === 'ERR_NOT_FOUND') return res.status(404).json({ error: 'Account not found' });
    res.status(500).json({ error: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const accountId = BigInt(req.params.id as string);
    await accountService.deleteAccount(userId, accountId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'ERR_NOT_FOUND') return res.status(404).json({ error: 'Account not found' });
    res.status(500).json({ error: error.message });
  }
};
