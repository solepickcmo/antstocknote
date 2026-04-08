import prisma from '../prisma';


export class NoteService {
  async createOrUpdateNote(userId: string, tradeId: bigint, mistakeType: string, content: string) {
    // verify ownership of trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { account: true }
    });

    if (!trade || trade.account.user_id !== userId || trade.account.is_deleted) {
      throw new Error('ERR_INVALID_TRADE');
    }

    return prisma.note.upsert({
      where: { trade_id: tradeId },
      update: { mistake_type: mistakeType, content, updated_at: new Date() },
      create: { trade_id: tradeId, mistake_type: mistakeType, content }
    });
  }

  async getNote(userId: string, tradeId: bigint) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { account: true }
    });

    if (!trade || trade.account.user_id !== userId || trade.account.is_deleted) {
      throw new Error('ERR_INVALID_TRADE');
    }

    return prisma.note.findUnique({ where: { trade_id: tradeId } });
  }
}

export const noteService = new NoteService();
