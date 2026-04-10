import prisma from '../prisma';

export class TradeService {
  async createTrade(userId: string, data: any) {
    const { ticker, name, type, price, quantity, fee, tradedAt, strategyTag, emotionTag, memo, isPublic } = data;
    
    // 2. Public profile disabled check
    if (isPublic) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.public_profile_enabled) {
        throw new Error('ERR_PUBLIC_NOT_ALLOWED');
      }
    }

    let pnl = null;
    let computedIsOpen = true;

    // BR-001, BR-003: PnL Calculation
    if (type === 'sell') {
      const buyTrades = await prisma.trade.findMany({
        where: { user_id: userId, ticker, type: 'buy' }
      });
      
      let totalQty = 0;
      let totalCost = 0;
      for (const t of buyTrades) {
        totalQty += Number(t.quantity);
        totalCost += Number(t.price) * Number(t.quantity);
      }

      const avgBuyPrice = totalQty > 0 ? (totalCost / totalQty) : 0;
      pnl = (Number(price) - avgBuyPrice) * Number(quantity) - Number(fee);
    }

    const trade = await prisma.trade.create({
      data: {
        user_id: userId,
        ticker,
        name,
        type,
        price,
        quantity,
        fee: fee || 0,
        pnl,
        traded_at: new Date(tradedAt),
        strategy_tag: strategyTag,
        emotion_tag: emotionTag,
        memo,
        is_open: computedIsOpen,
        is_public: isPublic || false,
      }
    });

    if (type === 'sell') {
      const allTrades = await prisma.trade.findMany({
        where: { user_id: userId, ticker }
      });
      
      let currentTotalQty = 0;
      for (const t of allTrades) {
        if (t.type === 'buy') {
          currentTotalQty += Number(t.quantity);
        } else if (t.type === 'sell') {
          currentTotalQty -= Number(t.quantity);
        }
      }

      if (currentTotalQty <= 0.00000001) {
        await prisma.trade.updateMany({
          where: { user_id: userId, ticker, is_open: true },
          data: { is_open: false }
        });
        computedIsOpen = false;
      }
    }

    return { ...trade, is_open: computedIsOpen };
  }

  async getTrades(userId: string, filters: any) {
    const page = Number(filters.page || 0);
    const size = Number(filters.size || 20);
    
    let whereClause: any = { user_id: userId };
    if (filters.ticker) whereClause.ticker = filters.ticker;
    if (filters.strategyTag) whereClause.strategy_tag = filters.strategyTag;
    if (filters.emotionTag) whereClause.emotion_tag = filters.emotionTag;
    if (filters.isOpen !== undefined) whereClause.is_open = filters.isOpen === 'true';
    if (filters.keyword) {
      whereClause.OR = [
        { name: { contains: filters.keyword } },
        { memo: { contains: filters.keyword } }
      ];
    }
    
    const [total, trades] = await Promise.all([
      prisma.trade.count({ where: whereClause }),
      prisma.trade.findMany({
        where: whereClause,
        orderBy: { traded_at: 'desc' },
        skip: page * size,
        take: size
      })
    ]);

    return { total, page, trades };
  }

  async getCalendar(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;

    const dailyPnL: any[] = await prisma.$queryRaw`
      SELECT DATE(traded_at) as "date", SUM(pnl) as "daily_pnl"
      FROM trades
      WHERE user_id = ${userId} AND type = 'sell' AND traded_at >= ${new Date(startDate)} AND traded_at < ${new Date(endDate)}
      GROUP BY DATE(traded_at)
    `;

    return {
      year, month,
      days: dailyPnL.map(d => {
        const pnlNum = Number(d.daily_pnl || 0);
        return {
          date: new Date(d.date).toISOString().split('T')[0],
          pnl: pnlNum,
          sign: pnlNum > 0 ? 'profit' : (pnlNum < 0 ? 'loss' : 'zero')
        };
      })
    };
  }
}

export const tradeService = new TradeService();
