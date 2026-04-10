import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const summary = await dashboardService.getSummary(userId);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
