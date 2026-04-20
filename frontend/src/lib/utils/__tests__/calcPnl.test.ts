import { describe, it, expect } from 'vitest';
import { calcPnlForSell, calcRemainingQty } from '../calcPnl';
import type { TradeLike } from '../calcPnl';

// ─────────────────────────────────────────────
// 테스트 픽스처 — 실제 데이터 형태를 모방한 샘플 Trade
// ─────────────────────────────────────────────

/** 테스트용 TradeLike 객체를 간편하게 생성하는 헬퍼 */
const makeTrade = (
  overrides: Partial<TradeLike> & Pick<TradeLike, 'type' | 'price' | 'quantity' | 'ticker'>
): TradeLike => ({
  ...overrides,
});

// ─────────────────────────────────────────────
// calcPnlForSell 테스트
// ─────────────────────────────────────────────

describe('calcPnlForSell', () => {
  it('기본 PnL이 올바르게 계산되어야 한다 (이동평균법)', () => {
    // 평균매수가 10,000 / 매도가 12,000 / 10주
    const trades = [makeTrade({ type: 'buy', ticker: 'AAPL', price: 10000, quantity: 10 })];
    // PnL = (12000 - 10000) * 10 = 20,000
    expect(calcPnlForSell('AAPL', 12000, 10, trades)).toBe(20000);
  });

  it('손실 케이스가 올바르게 계산되어야 한다', () => {
    const trades = [makeTrade({ type: 'buy', ticker: 'AAPL', price: 10000, quantity: 10 })];
    // PnL = (8000 - 10000) * 10 = -20,000
    expect(calcPnlForSell('AAPL', 8000, 10, trades)).toBe(-20000);
  });

  it('분할 매수 후 이동평균가로 계산되어야 한다', () => {
    // 1차 10주 @10,000 + 2차 10주 @12,000 → 평균 11,000
    const trades = [
      makeTrade({ type: 'buy', ticker: 'AAPL', price: 10000, quantity: 10 }),
      makeTrade({ type: 'buy', ticker: 'AAPL', price: 12000, quantity: 10 }),
    ];
    // PnL = (13000 - 11000) * 5 = 10,000
    expect(calcPnlForSell('AAPL', 13000, 5, trades)).toBe(10000);
  });

  it('매수 내역이 없으면 0을 반환해야 한다', () => {
    expect(calcPnlForSell('AAPL', 10000, 5, [])).toBe(0);
  });

  it('다른 종목의 매수 내역은 포함하지 않아야 한다', () => {
    const trades = [
      makeTrade({ type: 'buy', ticker: 'SAMSUNG', price: 70000, quantity: 5 }),
      makeTrade({ type: 'buy', ticker: 'KAKAO',   price: 50000, quantity: 5 }),
    ];
    // SAMSUNG만 10% 상승 매도
    expect(calcPnlForSell('SAMSUNG', 77000, 5, trades)).toBe(35000);
  });

  it('부동소수점 케이스에서도 합리적인 결과를 반환해야 한다', () => {
    // 1/3 가격대 매수 → 이동평균법 계산
    const trades = [makeTrade({ type: 'buy', ticker: 'TEST', price: 33.33, quantity: 1 })];
    const result = calcPnlForSell('TEST', 33.34, 1, trades);
    // Math.floor 적용으로 소수점 절사 → 0
    expect(result).toBe(0);
  });
});

// ─────────────────────────────────────────────
// calcRemainingQty 테스트
// ─────────────────────────────────────────────

describe('calcRemainingQty', () => {
  it('전량 매도 시 isFullySold = true여야 한다', () => {
    const { remaining, isFullySold } = calcRemainingQty(10, 10);
    expect(remaining).toBeCloseTo(0, 6);
    expect(isFullySold).toBe(true);
  });

  it('부분 매도 시 isFullySold = false여야 한다', () => {
    const { remaining, isFullySold } = calcRemainingQty(10, 5);
    expect(remaining).toBe(5);
    expect(isFullySold).toBe(false);
  });

  it('부동소수점 오차(2.84e-14)를 처리해야 한다', () => {
    // 실제 발생 케이스: 30 - 30 = 2.84e-14
    const rawRemaining = 30.0 - 29.999999999999996;
    const { isFullySold } = calcRemainingQty(rawRemaining, 0);
    // 0.000001 미만이므로 전량 매도로 처리되어야 함
    expect(isFullySold).toBe(true);
  });
});
