// ─────────────────────────────────────────────
// calcPnl.ts — PnL 계산 유틸리티
//
// tradeStore에서 분리한 이유:
//   1. 순수 함수로만 구성 → 단위 테스트가 쉬움
//   2. Store 의존성 없이 어디서든 import 가능
//   3. 비즈니스 로직을 UI/상태와 명확히 분리
//
// Trade 타입은 순환 참조 방지를 위해 최소 인터페이스를 로컬 정의.
// tradeStore.ts의 Trade와 구조적으로 동일해야 한다.
// ─────────────────────────────────────────────

/** PnL 계산에 필요한 Trade의 최소 인터페이스 (순환 참조 방지) */
export interface TradeLike {
  ticker: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
}

/**
 * 이동평균법으로 매도 PnL을 계산한다.
 *
 * FIFO가 아닌 이동평균법을 쓰는 이유:
 *   분할 매수 케이스에서 매수 단가가 계속 변하므로
 *   가중평균(이동평균)이 실제 투자 원가에 더 부합함.
 *
 * @param ticker 종목 코드 (어느 종목인지 필터링에 사용)
 * @param sellPrice 매도 체결가
 * @param sellQty 매도 수량
 * @param allTrades 해당 유저의 전체 매매 내역 (누적 이동평균 계산에 필요)
 * @returns 실현 손익 (원 단위, Math.floor 적용)
 */
export const calcPnlForSell = (
  ticker: string,
  sellPrice: number,
  sellQty: number,
  allTrades: TradeLike[]
): number => {
  // 해당 종목의 매수 내역만 필터링
  const buyTrades = allTrades.filter(
    (t) => t.ticker === ticker && t.type === 'buy'
  );

  // 매수 내역이 없으면 손익 없음
  if (buyTrades.length === 0) return 0;

  // 총 매수 금액과 총 수량으로 이동평균가 계산
  let totalBuyCost = 0;
  let totalBuyQty  = 0;

  buyTrades.forEach((t) => {
    totalBuyCost += Number(t.price) * Number(t.quantity);
    totalBuyQty  += Number(t.quantity);
  });

  const avgBuyPrice = totalBuyCost / totalBuyQty;

  // PnL = (매도가 - 평균매수가) × 매도수량
  // Math.floor: 원 단위 절사 (은행가 반올림 불필요)
  return Math.floor((sellPrice - avgBuyPrice) * sellQty);
};

/**
 * 잔여 수량 계산 후 전량 매도 여부를 판단한다.
 *
 * 부동소수점 오차 방어:
 *   30 - 30 = 2.84e-14 같은 케이스가 실제로 발생하므로
 *   toFixed(8) 후 다시 parseFloat으로 정규화.
 *
 * @param buyQty 총 매수 수량
 * @param sellQty 총 매도 수량 (이번 매도 포함)
 * @returns { remaining: number, isFullySold: boolean }
 */
export const calcRemainingQty = (
  buyQty: number,
  sellQty: number
): { remaining: number; isFullySold: boolean } => {
  const remaining   = parseFloat((buyQty - sellQty).toFixed(8));
  const isFullySold = remaining < 0.000001;
  return { remaining, isFullySold };
};
