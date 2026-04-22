import { Router } from 'express';
import {
  getAnalyses,
  getAnalysesByTicker,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis,
} from '../controllers/stockAnalysis.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

// 라우트 순서 주의: /ticker/:ticker가 /:id보다 먼저 등록되어야 충돌 없음
router.get('/', getAnalyses);                       // 전체 목록 (ticker 쿼리 파라미터 필터 가능)
router.get('/ticker/:ticker', getAnalysesByTicker); // 특정 종목 분석 목록
router.post('/', createAnalysis);                   // 분석 생성
router.patch('/:id', updateAnalysis);               // 분석 수정
router.delete('/:id', deleteAnalysis);              // 분석 삭제

export default router;
