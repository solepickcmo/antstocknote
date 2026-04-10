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
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new Error('Invalid Token');
      }

      req.user = { id: user.id };
      next();
    } catch (error) {
      res.status(401).json({ error: 'ERR_INVALID_CREDENTIALS', message: '유효하지 않은 토큰입니다.' });
    }
  } else {
    res.status(401).json({ error: 'ERR_MISSING_TOKEN', message: '인증 토큰이 필요합니다.' });
  }
};
