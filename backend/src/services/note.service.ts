import prisma from '../prisma';

export class NoteService {
  async createOrUpdateNote(userId: string, tradeId: number, mistakeType: string, content: string) {
    // verify ownership of trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade || trade.user_id !== userId) {
      throw new Error('ERR_INVALID_TRADE');
    }

    return prisma.note.upsert({
      where: { trade_id: tradeId },
      update: { mistake_type: mistakeType, content, updated_at: new Date() },
      create: { trade_id: tradeId, mistake_type: mistakeType, content }
    });
  }

  async getNote(userId: string, tradeId: number) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade || trade.user_id !== userId) {
      throw new Error('ERR_INVALID_TRADE');
    }

    return prisma.note.findUnique({ where: { trade_id: tradeId } });
  }
}

export const noteService = new NoteService();
