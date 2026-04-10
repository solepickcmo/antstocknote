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
    // 1. Delete from application database ( cascading will handle trades, notes, tags )
    await prisma.user.delete({
      where: { id: userId }
    });

    // 2. Delete from Supabase Auth ( requires service role key )
    if (supabaseAdmin) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error('Failed to delete user from Supabase Auth:', deleteError);
        // We still continue because the main data is deleted from our DB
      }
    } else {
      console.warn('supabaseAdmin is not initialized. Skipping Supabase Auth deletion.');
    }

    return res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error('Error during account withdrawal:', error);
    return res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
  }
};
