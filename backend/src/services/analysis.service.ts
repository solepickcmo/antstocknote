import prisma from '../prisma';

export class AnalysisService {
  async getStrategyStats(userId: string) {
    const stats: any[] = await prisma.$queryRaw`
      SELECT 
          strategy_tag as "tag",
          COUNT(*) as "total",
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as "wins",
          AVG(pnl) as "avgPnl"
      FROM trades
      WHERE user_id = ${userId} AND type = 'sell' AND strategy_tag IS NOT NULL
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

  async getEmotionStats(userId: string) {
    const stats: any[] = await prisma.$queryRaw`
      SELECT 
          emotion_tag as "tag",
          COUNT(*) as "total",
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as "wins",
          AVG(pnl) as "avgPnl"
      FROM trades
      WHERE user_id = ${userId} AND type = 'sell' AND emotion_tag IS NOT NULL
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

  async getMistakesStats(userId: string) {
    const stats: any[] = await prisma.$queryRaw`
      SELECT 
          strategy_tag as "type",
          COUNT(*) as "count"
      FROM trades
      WHERE user_id = ${userId} AND type = 'sell' AND pnl < 0 AND strategy_tag IS NOT NULL
      GROUP BY strategy_tag
      ORDER BY count DESC
    `;

    return stats.map(s => ({
      type: s.type,
      count: Number(s.count) || 0
    }));
  }

  async getNotes(userId: string) {
    const notes: any[] = await prisma.$queryRaw`
      SELECT 
          n.id,
          n.content,
          n.created_at as "createdAt",
          t.id as "tradeId",
          t.name as "stockName",
          t.ticker,
          t.traded_at as "tradeDate",
          t.strategy_tag as "strategyTag"
      FROM notes n
      INNER JOIN trades t ON n.trade_id = t.id
      WHERE t.user_id = ${userId}
      ORDER BY n.created_at DESC
    `;
    
    return notes.map(n => ({
      id: String(n.id),
      tradeId: String(n.tradeId),
      content: n.content,
      createdAt: n.createdAt,
      stockName: n.stockName,
      ticker: n.ticker,
      tradeDate: n.tradeDate,
      strategyTag: n.strategyTag
    }));
  }
}

export const analysisService = new AnalysisService();
