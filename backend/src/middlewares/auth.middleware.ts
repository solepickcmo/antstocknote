import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'ERR_MISSING_TOKEN', message: '인증 토큰이 누락되었습니다.' });
      return;
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'ERR_INVALID_CREDENTIALS', message: '유효하지 않은 토큰입니다.' });
    }
  } else {
    res.status(401).json({ error: 'ERR_MISSING_TOKEN', message: '인증 토큰이 필요합니다.' });
  }
};
