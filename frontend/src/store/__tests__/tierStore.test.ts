import { describe, it, expect } from 'vitest';
import { canAccessFeature } from '../../store/tierStore';

/**
 * tierStore 권한 로직 단위 테스트 (orchestration.md §12)
 *
 * 스토어 인스턴스 없이 canAccessFeature() 순수 함수만 테스트한다.
 * Zustand 스토어 Mock이 필요없어 설정이 단순해진다.
 */
describe('canAccessFeature', () => {
  // ── Free Tier 접근 가능 기능 ─────────────────

  it('free: 매매 기록(trade_record) 접근 가능 (월 30건 제한 있음)', () => {
    expect(canAccessFeature('trade_record', 'free')).toBe(true);
  });

  it('free: 수익 캘린더(calendar) 접근 가능', () => {
    expect(canAccessFeature('calendar', 'free')).toBe(true);
  });

  it('free: 히스토리 최근 3개월(history_recent) 접근 가능', () => {
    expect(canAccessFeature('history_recent', 'free')).toBe(true);
  });

  it('free: CSV 다운로드(export_csv) 접근 가능', () => {
    expect(canAccessFeature('export_csv', 'free')).toBe(true);
  });

  it('free: 기본 분석/복기(analysis) 접근 가능', () => {
    expect(canAccessFeature('analysis', 'free')).toBe(true);
  });

  it('free: 테마 토글(theme_toggle) 접근 가능', () => {
    expect(canAccessFeature('theme_toggle', 'free')).toBe(true);
  });

  // ── Free Tier 접근 불가 기능 ─────────────────

  it('free: 계산기(calculators) 접근 불가', () => {
    expect(canAccessFeature('calculators', 'free')).toBe(false);
  });

  it('free: 기간 직접 설정(history_date_range) 접근 불가', () => {
    expect(canAccessFeature('history_date_range', 'free')).toBe(false);
  });


  it('free: 감정×수익 분석(emotion_analysis) 접근 불가', () => {
    expect(canAccessFeature('emotion_analysis', 'free')).toBe(false);
  });

  it('free: CSV 일괄 업로드(csv_bulk_upload) 접근 불가', () => {
    expect(canAccessFeature('csv_bulk_upload', 'free')).toBe(false);
  });

  it('free: AI 고급 분석(ai_analysis) 접근 불가', () => {
    expect(canAccessFeature('ai_analysis', 'free')).toBe(false);
  });

  it('free: 커뮤니티(community) 접근 불가', () => {
    expect(canAccessFeature('community', 'free')).toBe(false);
  });

  // ── Premium Tier — 전체 기능 접근 가능 ───────

  it('premium: 계산기(calculators) 접근 가능', () => {
    expect(canAccessFeature('calculators', 'premium')).toBe(true);
  });

  it('premium: 기간 직접 설정(history_date_range) 접근 가능', () => {
    expect(canAccessFeature('history_date_range', 'premium')).toBe(true);
  });


  it('premium: 감정×수익 분석(emotion_analysis) 접근 가능', () => {
    expect(canAccessFeature('emotion_analysis', 'premium')).toBe(true);
  });

  it('premium: AI 고급 분석(ai_analysis) 접근 가능', () => {
    expect(canAccessFeature('ai_analysis', 'premium')).toBe(true);
  });


  it('premium: 커뮤니티(community) 접근 가능', () => {
    expect(canAccessFeature('community', 'premium')).toBe(true);
  });
});
