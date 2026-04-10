import prisma from '../prisma';

export class DashboardService {
  async getSummary(userId: string) {
    // 전략별 통계 (이전의 dashboard용 raw query)
    const strategyStats: any[] = await prisma.$queryRaw`
      SELECT 
          strategy_tag as "tag",
          COUNT(*) as "total",
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as "wins",
          AVG(pnl) as "avgPnl"
      FROM trades
      WHERE user_id = ${userId} AND type = 'sell'
      GROUP BY strategy_tag
    `;

    // get total assets logic 
    const totalPnlQuery: any[] = await prisma.$queryRaw`
      SELECT SUM(pnl) as "totalPnl" FROM trades WHERE user_id = ${userId} AND type = 'sell'
    `;
    const totalPnl = Number(totalPnlQuery[0]?.totalPnl || 0);

    return {
      totalPnl,
      strategies: strategyStats.map(s => {
        const total = Number(s.total);
        const wins = Number(s.wins);
        return {
          tag: s.tag || '미지정',
          total,
          winRate: total > 0 ? (wins / total * 100).toFixed(2) : 0,
          avgPnl: Number(s.avgPnl || 0).toFixed(2)
        };
      })
    };
  }
}

export const dashboardService = new DashboardService();
