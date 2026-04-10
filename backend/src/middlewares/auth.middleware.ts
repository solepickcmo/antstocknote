import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'ERR_MISSING_TOKEN', message: '인증 토큰이 누락되었습니다.' });
      return;
    }

    try {
      const { data: { user }, error: authVerificationError } = await supabase.auth.getUser(token);
      
      if (authVerificationError || !user) {
        console.error('Supabase token verification failed:', authVerificationError?.message || 'No user returned');
        res.status(401).json({ error: 'ERR_INVALID_CREDENTIALS', message: '유효하지 않은 토큰입니다.' });
        return;
      }

      req.user = { id: user.id };
      next();
    } catch (error) {
      console.error('Unexpected error in auth middleware:', error);
      res.status(500).json({ error: 'ERR_INTERNAL', message: '서버 내부 인증 처리 오류가 발생했습니다.' });
    }
  } else {
    res.status(401).json({ error: 'ERR_MISSING_TOKEN', message: '인증 토큰이 필요합니다.' });
  }
};
