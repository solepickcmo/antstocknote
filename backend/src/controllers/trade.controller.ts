import { Request, Response } from 'express';
import { tradeService } from '../services/trade.service';

export const createTrade = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const trade = await tradeService.createTrade(userId, req.body);
    // BigInt 직렬화 처리
    res.status(201).json({
      ...trade,
      id: trade.id.toString()
    });
  } catch (error: any) {
    if (error.message === 'ERR_PUBLIC_NOT_ALLOWED') {
      res.status(403).json({ code: 'ERR_PUBLIC_NOT_ALLOWED', message: '공개 프로필이 비활성화되어 있습니다.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getTrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const result = await tradeService.getTrades(userId, req.query);
    res.status(200).json({
      ...result,
      trades: result.trades.map(t => ({
        ...t,
        id: t.id.toString()
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCalendar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    
    if (!year || !month) {
      return res.status(400).json({ error: 'year, and month are required' });
    }

    const calendar = await tradeService.getCalendar(userId, year, month);
    res.status(200).json(calendar);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
