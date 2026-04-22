import { Request, Response } from 'express';
import { principleService } from '../services/principle.service';

/** GET /api/v1/principles — 내 원칙 목록 조회 */
export const getPrinciples = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const principles = await principleService.getPrinciples(userId);
    res.status(200).json(principles);
  } catch (error: any) {
    console.error('[PrincipleController] getPrinciples 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

/** PUT /api/v1/principles — 원칙 저장/수정 (배열 upsert) */
export const savePrinciples = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { principles } = req.body;

    // 입력 검증: 배열 형식 + 각 항목에 order_num, content 필수
    if (!Array.isArray(principles)) {
      res.status(400).json({ error: 'ERR_INVALID_INPUT', message: 'principles 배열이 필요합니다.' });
      return;
    }

    const MAX_PRINCIPLES = 5;
    if (principles.length > MAX_PRINCIPLES) {
      res.status(400).json({
        error: 'ERR_TOO_MANY',
        message: `투자 원칙은 최대 ${MAX_PRINCIPLES}개까지 저장할 수 있습니다.`,
      });
      return;
    }

    const saved = await principleService.savePrinciples(userId, principles);
    res.status(200).json(saved);
  } catch (error: any) {
    console.error('[PrincipleController] savePrinciples 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

/** DELETE /api/v1/principles/:id — 단일 원칙 삭제 */
export const deletePrinciple = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await principleService.deletePrinciple(userId, id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'ERR_NOT_FOUND') {
      res.status(404).json({ error: 'ERR_NOT_FOUND', message: '해당 원칙을 찾을 수 없습니다.' });
      return;
    }
    console.error('[PrincipleController] deletePrinciple 실패:', error);
    res.status(500).json({ error: error.message });
  }
};
