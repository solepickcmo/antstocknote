import { useMemo } from 'react';
import { useTradeStore } from '../store/tradeStore';

export interface HoldingSummary {
  ticker: string;
  name: string;
  avgPrice: number;
  quantity: number;
  currentValue: number;
}

export const useHoldingsSelector = () => {
  const trades = useTradeStore(state => state.trades);

  const currentHoldings = useMemo((): HoldingSummary[] => {
    const map = new Map<string, { ticker: string; name: string; totalCost: number; quantity: number }>();
    
    // 시간순 정렬하여 수량 계산 (매수 -> 매도 순)
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime()
    );

    sortedTrades.forEach(trade => {
      if (!map.has(trade.ticker)) {
        map.set(trade.ticker, { ticker: trade.ticker, name: trade.name, totalCost: 0, quantity: 0 });
      }
      const holding = map.get(trade.ticker)!;
      const qty = Number(trade.quantity);
      const price = Number(trade.price);

      if (trade.type === 'buy') {
        holding.quantity += qty;
        holding.totalCost += price * qty;
      } else if (trade.type === 'sell' && holding.quantity > 0) {
        const avgCost = holding.totalCost / holding.quantity;
        holding.quantity -= qty;
        holding.totalCost -= avgCost * qty;
      }
    });

    const result: HoldingSummary[] = [];
    map.forEach(holding => {
      if (holding.quantity > 0.000001) {
        result.push({
          ticker: holding.ticker,
          name: holding.name,
          avgPrice: holding.totalCost / holding.quantity,
          quantity: holding.quantity,
          currentValue: holding.totalCost // 계산기 초기값용
        });
      }
    });

    return result.sort((a, b) => a.ticker.localeCompare(b.ticker));
  }, [trades]);

  return { currentHoldings };
};
