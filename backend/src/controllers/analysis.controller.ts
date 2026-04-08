import { Request, Response } from 'express';
import { analysisService } from '../services/analysis.service';

export const getStrategyStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const accountId = req.query.accountId as string;
    
    if (!accountId) return res.status(400).json({ code: 'ERR_BAD_REQUEST', message: 'accountId가 필요합니다.' });

    const strategies = await analysisService.getStrategyStats(userId, accountId);
    res.status(200).json({ strategies });
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_ACCOUNT') {
      res.status(400).json({ code: 'ERR_INVALID_ACCOUNT', message: '접근할 수 없는 계좌입니다.' });
    } else {
      res.status(500).json({ code: 'ERR_SERVER', message: error.message });
    }
  }
};

export const getEmotionStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const accountId = req.query.accountId as string;
    
    if (!accountId) return res.status(400).json({ code: 'ERR_BAD_REQUEST', message: 'accountId가 필요합니다.' });

    const emotions = await analysisService.getEmotionStats(userId, accountId);
    res.status(200).json({ emotions });
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_ACCOUNT') {
      res.status(400).json({ code: 'ERR_INVALID_ACCOUNT', message: '접근할 수 없는 계좌입니다.' });
    } else {
      res.status(500).json({ code: 'ERR_SERVER', message: error.message });
    }
  }
};

export const getMistakesStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const accountId = req.query.accountId as string;
    
    if (!accountId) return res.status(400).json({ code: 'ERR_BAD_REQUEST', message: 'accountId가 필요합니다.' });

    const mistakes = await analysisService.getMistakesStats(userId, accountId);
    res.status(200).json({ mistakes });
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_ACCOUNT') {
      res.status(400).json({ code: 'ERR_INVALID_ACCOUNT', message: '접근할 수 없는 계좌입니다.' });
    } else {
      res.status(500).json({ code: 'ERR_SERVER', message: error.message });
    }
  }
};
