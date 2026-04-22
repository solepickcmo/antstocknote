import { Router } from 'express';
import { getPrinciples, savePrinciples, deletePrinciple } from '../controllers/principle.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// 모든 엔드포인트에 JWT 인증 미들웨어 적용
router.use(authenticateJWT);

router.get('/', getPrinciples);          // 내 원칙 목록 조회
router.put('/', savePrinciples);         // 원칙 배열 저장/수정 (통째로 upsert)
router.delete('/:id', deletePrinciple);  // 단일 원칙 삭제

export default router;
