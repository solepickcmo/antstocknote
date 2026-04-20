import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';
import { supabaseAdmin } from '../utils/supabase';

export const withdrawAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: '인증되지 않은 사용자입니다.' });
  }

  try {
    // 1. Soft Delete - Update deleted_at in application database
    await prisma.user.update({
      where: { id: userId },
      data: { deleted_at: new Date() }
    });

    // 2. Update related subscriptions to 'canceled' (if managed in Prisma too)
    await (prisma as any).subscription.updateMany({
      where: { user_id: userId },
      data: { status: 'canceled', deleted_at: new Date() }
    });

    // 3. Optional: Block Supabase Auth login if needed
    // Note: Profiles deletion is handled by users.update in our Prisma schema (if mapped correctly)

    return res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error('Error during account withdrawal:', error);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
};
