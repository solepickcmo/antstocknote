import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'ERR_EMAIL_DUPLICATE') {
      res.status(409).json({ code: 'ERR_EMAIL_DUPLICATE', message: '이미 존재하는 이메일입니다.' });
    } else {
      res.status(500).json({ code: 'ERR_SERVER', message: error.message });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'ERR_INVALID_CREDENTIALS') {
      res.status(401).json({ code: 'ERR_INVALID_CREDENTIALS', message: '인증에 실패했습니다.' });
    } else {
      res.status(500).json({ code: 'ERR_SERVER', message: error.message });
    }
  }
};
