import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const accountId = req.query.accountId as string;
    
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const summary = await dashboardService.getSummary(userId, accountId);
    res.status(200).json(summary);
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_ACCOUNT') {
      res.status(400).json({ error: 'Account not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};
