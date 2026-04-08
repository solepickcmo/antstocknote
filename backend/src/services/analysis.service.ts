import prisma from '../prisma';


export class AnalysisService {
  async getStrategyStats(userId: string, accountId: string) {
    const account = await prisma.account.findUnique({ where: { id: BigInt(accountId) } });
    if (!account || account.user_id !== userId || account.is_deleted) {
      throw new Error('ERR_INVALID_ACCOUNT');
    }

    const stats: any[] = await prisma.$queryRaw`
      SELECT 
          strategy_tag as "tag",
          COUNT(*) as "total",
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as "wins",
          AVG(pnl) as "avgPnl"
      FROM trades
      WHERE account_id = ${BigInt(accountId)} AND type = 'sell'::"string" AND strategy_tag IS NOT NULL
      GROUP BY strategy_tag
    `;

    return stats.map(s => {
      const total = Number(s.total) || 0;
      const wins = Number(s.wins) || 0;
      return {
        tag: s.tag,
        total,
        winRate: Number((total > 0 ? (wins / total * 100) : 0).toFixed(2)),
        avgPnl: Number(Number(s.avgPnl || 0).toFixed(2))
      };
    });
  }

  async getEmotionStats(userId: string, accountId: string) {
    const account = await prisma.account.findUnique({ where: { id: BigInt(accountId) } });
    if (!account || account.user_id !== userId || account.is_deleted) {
      throw new Error('ERR_INVALID_ACCOUNT');
    }

    const stats: any[] = await prisma.$queryRaw`
      SELECT 
          emotion_tag as "tag",
          COUNT(*) as "total",
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as "wins",
          AVG(pnl) as "avgPnl"
      FROM trades
      WHERE account_id = ${BigInt(accountId)} AND type = 'sell'::"string" AND emotion_tag IS NOT NULL
      GROUP BY emotion_tag
    `;

    return stats.map(s => {
      const total = Number(s.total) || 0;
      return {
        tag: s.tag,
        total,
        avgPnl: Number(Number(s.avgPnl || 0).toFixed(2))
      };
    });
  }

  async getMistakesStats(userId: string, accountId: string) {
    const account = await prisma.account.findUnique({ where: { id: BigInt(accountId) } });
    if (!account || account.user_id !== userId || account.is_deleted) {
      throw new Error('ERR_INVALID_ACCOUNT');
    }

    const stats: any[] = await prisma.$queryRaw`
      SELECT 
          n.mistake_type as "type",
          COUNT(*) as "count"
      FROM notes n
      INNER JOIN trades t ON n.trade_id = t.id
      WHERE t.account_id = ${BigInt(accountId)} AND n.mistake_type IS NOT NULL
      GROUP BY n.mistake_type
    `;

    return stats.map(s => ({
      type: s.type,
      count: Number(s.count) || 0
    }));
  }
}

export const analysisService = new AnalysisService();
