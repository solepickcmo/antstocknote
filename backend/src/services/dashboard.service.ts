import prisma from '../prisma';


export class DashboardService {
  async getSummary(userId: string, accountId: string) {
    const account = await prisma.account.findUnique({ where: { id: BigInt(accountId) } });
    if (!account || account.user_id !== userId || account.is_deleted) throw new Error('ERR_INVALID_ACCOUNT');
    
    // v_strategy_stats logic via queryRaw
    const strategyStats: any[] = await prisma.$queryRaw`
      SELECT 
          strategy_tag as "tag",
          COUNT(*) as "total",
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as "wins",
          AVG(pnl) as "avgPnl"
      FROM trades
      WHERE account_id = ${BigInt(accountId)} AND type = 'sell'::"string"
      GROUP BY strategy_tag
    `;

    // get total assets logic (mocked logic or sum logic based on PnL)
    // To properly calculate total assets, you need initial capital + total PnL
    // For MVP, we'll return the total sum of PnL across all time.
    const totalPnlQuery: any[] = await prisma.$queryRaw`
      SELECT SUM(pnl) as "totalPnl" FROM trades WHERE account_id = ${BigInt(accountId)} AND type = 'sell'::"string"
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
