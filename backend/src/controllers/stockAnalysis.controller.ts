import { Request, Response } from 'express';
import { stockAnalysisService } from '../services/stockAnalysis.service';

/** GET /api/v1/stock-analyses — 전체 분석 목록 (ticker 필터 가능) */
export const getAnalyses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await stockAnalysisService.getAnalyses(userId, req.query as any);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('[StockAnalysisController] getAnalyses 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

/** GET /api/v1/stock-analyses/ticker/:ticker — 특정 종목 분석 목록 */
export const getAnalysesByTicker = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { ticker } = req.params;
    const analyses = await stockAnalysisService.getAnalysesByTicker(userId, ticker);
    res.status(200).json(analyses);
  } catch (error: any) {
    console.error('[StockAnalysisController] getAnalysesByTicker 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

/** POST /api/v1/stock-analyses — 분석 생성 */
export const createAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { ticker, stock_name, title, content, analysis_date } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'ERR_INVALID_INPUT', message: '제목과 내용은 필수입니다.' });
      return;
    }

    const analysis = await stockAnalysisService.createAnalysis(userId, {
      ticker, stock_name, title, content, analysis_date,
    });
    res.status(201).json(analysis);
  } catch (error: any) {
    console.error('[StockAnalysisController] createAnalysis 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

/** PATCH /api/v1/stock-analyses/:id — 분석 수정 */
export const updateAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updated = await stockAnalysisService.updateAnalysis(userId, id, req.body);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error.message === 'ERR_NOT_FOUND') {
      res.status(404).json({ error: 'ERR_NOT_FOUND', message: '해당 분석을 찾을 수 없습니다.' });
      return;
    }
    console.error('[StockAnalysisController] updateAnalysis 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

/** DELETE /api/v1/stock-analyses/:id — 분석 삭제 */
export const deleteAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    await stockAnalysisService.deleteAnalysis(userId, id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'ERR_NOT_FOUND') {
      res.status(404).json({ error: 'ERR_NOT_FOUND', message: '해당 분석을 찾을 수 없습니다.' });
      return;
    }
    console.error('[StockAnalysisController] deleteAnalysis 실패:', error);
    res.status(500).json({ error: error.message });
  }
};
