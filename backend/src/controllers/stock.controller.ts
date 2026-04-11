import { Request, Response } from 'express';
import prisma from '../prisma';

export const searchStocks = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(200).json([]);
    }
    
    // ILIKE %query% search in Postgres using the GIN index for name, or B-Tree for ticker
    const dbResults = await prisma.stockMaster.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { ticker: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 20
    });

    // Map StockMaster schema back to the shape expected by frontend TradeModal
    const results = dbResults.map(stock => ({
      symbol: stock.ticker,
      nameKo: stock.name,
      nameEn: '', // Not used in new CSV configuration
      marketCode: stock.market
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching stocks from DB:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
