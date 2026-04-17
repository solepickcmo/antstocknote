/** 정수 원화 포맷 — 콤마 + 단위 */
export const fmtKRW = (n: number): string =>
  Math.round(n).toLocaleString('ko-KR') + '원';

/** 소수점 포함 포맷 */
export const fmtNum = (n: number, digits = 2): string =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** 퍼센트 포맷 */
export const fmtPct = (n: number, digits = 2): string =>
  n.toFixed(digits) + '%';

/** 배수 포맷 */
export const fmtX = (n: number): string =>
  n.toFixed(1) + '배';

/** 입력 필드 실시간 콤마 포맷 (onChange용) */
export const fmtInput = (raw: string): string => {
  const num = raw.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('ko-KR');
};

/** 콤마 제거 유틸 (숫자 추출용) */
export const parseRaw = (val: string): number => {
  return Number(val.replace(/,/g, '')) || 0;
};
