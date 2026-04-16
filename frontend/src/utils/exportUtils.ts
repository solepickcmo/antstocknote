import type { Trade } from '../store/tradeStore';

/**
 * 매매 내역을 CSV 파일로 내보냅니다.
 * 엑셀에서 한글 깨짐을 방지하기 위해 UTF-8 BOM(\uFEFF)을 추가합니다.
 */
export const exportTradesToCSV = (trades: Trade[]) => {
  if (!trades || trades.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  // 헤더 정의
  const headers = [
    '체결일시',
    '종목코드',
    '종목명',
    '유형',
    '체결가',
    '수량',
    '수수료',
    '손익',
    '전략태그',
    '감정태그',
    '메모',
    '보유중'
  ];

  // 데이터 행 생성
  const rows = trades.map((trade) => [
    new Date(trade.traded_at).toLocaleString(),
    trade.ticker,
    trade.name,
    trade.type === 'buy' ? '매수' : '매도',
    trade.price,
    trade.quantity,
    trade.fee,
    trade.pnl ?? '',
    trade.strategy_tag ?? '',
    trade.emotion_tag ?? '',
    trade.memo?.replace(/\n/g, ' ') ?? '', // 줄바꿈 제거
    trade.is_open ? 'O' : 'X'
  ]);

  // CSV 문자열 합치기
  const csvContent = [headers, ...rows]
    .map((row) => row.join(','))
    .join('\n');

  // 다운로드 트리거
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `개미노트_매매내역_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
