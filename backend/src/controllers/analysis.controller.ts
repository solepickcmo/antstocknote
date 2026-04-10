import { Request, Response } from 'express';
import { analysisService } from '../services/analysis.service';

export const getStrategyStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const strategies = await analysisService.getStrategyStats(userId);
    res.status(200).json({ strategies });
  } catch (error: any) {
    res.status(500).json({ code: 'ERR_SERVER', message: error.message });
  }
};

export const getEmotionStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const emotions = await analysisService.getEmotionStats(userId);
    res.status(200).json({ emotions });
  } catch (error: any) {
    res.status(500).json({ code: 'ERR_SERVER', message: error.message });
  }
};

export const getMistakesStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const mistakes = await analysisService.getMistakesStats(userId);
    res.status(200).json({ mistakes });
  } catch (error: any) {
    res.status(500).json({ code: 'ERR_SERVER', message: error.message });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notes = await analysisService.getNotes(userId);
    res.status(200).json({ notes });
  } catch (error: any) {
    res.status(500).json({ code: 'ERR_SERVER', message: error.message });
  }
};
