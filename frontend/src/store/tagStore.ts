// ─────────────────────────────────────────────
// tagStore.ts
// 전략 태그와 감정 태그를 관리하는 스토어입니다.
// 매수(Buy)와 매도(Sell) 상황에 최적화된 고정 태그 세트를 제공합니다.
// ─────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  type: 'strategy' | 'emotion';
  tradeType: 'buy' | 'sell' | 'both';
}

// ─────────────────────────────────────────────
// 고정 태그 정의
// ─────────────────────────────────────────────

export const ALL_TAGS: Tag[] = [
  // 매수 전략 (Strategy - Buy)
  { id: 1, name: '#상승올라타기', type: 'strategy', tradeType: 'buy' },  // 돌파매수
  { id: 2, name: '#떨어질때줍기', type: 'strategy', tradeType: 'buy' },  // 눌림목매수
  { id: 3, name: '#단타한방', type: 'strategy', tradeType: 'buy' },  // 시가베팅
  { id: 4, name: '#조금씩담기', type: 'strategy', tradeType: 'buy' },  // 분할매수
  { id: 5, name: '#추세따라가기', type: 'strategy', tradeType: 'buy' },  // 추세추종
  { id: 6, name: '#많이빠졌다', type: 'strategy', tradeType: 'buy' },  // 낙주매입
  { id: 7, name: '#뉴스보고샀다', type: 'strategy', tradeType: 'buy' },  // 재료매매
  { id: 8, name: '#계획대로샀다', type: 'strategy', tradeType: 'buy' },  // 계획매입
  { id: 9, name: '#일단맛보기', type: 'strategy', tradeType: 'buy' },  // 정찰병
  { id: 10, name: '#지인추천(반성)', type: 'strategy', tradeType: 'buy' },  // 뇌동매수

  // 매도 전략 (Strategy - Sell)
  { id: 11, name: '#목표달성익절', type: 'strategy', tradeType: 'sell' }, // 목표가익절
  { id: 12, name: '#계획손절', type: 'strategy', tradeType: 'sell' }, // 손절(계획)
  { id: 13, name: '#조금씩팔기', type: 'strategy', tradeType: 'sell' }, // 분할매도
  { id: 14, name: '#올라가며팔기', type: 'strategy', tradeType: 'sell' }, // 트레일링스탑
  { id: 15, name: '#본전탈출', type: 'strategy', tradeType: 'sell' }, // 본절탈출
  { id: 16, name: '#흐름깨져서', type: 'strategy', tradeType: 'sell' }, // 추세이탈매도
  { id: 17, name: '#손실줄이기', type: 'strategy', tradeType: 'sell' }, // 리스크관리
  { id: 18, name: '#기한이됐다', type: 'strategy', tradeType: 'sell' }, // 기간매도
  { id: 19, name: '#반등에팔기', type: 'strategy', tradeType: 'sell' }, // 기술적반등
  { id: 20, name: '#포모매도(반성)', type: 'strategy', tradeType: 'sell' }, // 뇌동매도

  // 매수 감정 (Emotion - Buy)
  { id: 21, name: '#이건된다', type: 'emotion', tradeType: 'buy' },  // 자신감
  { id: 22, name: '#두근두근', type: 'emotion', tradeType: 'buy' },  // 설렘
  { id: 23, name: '#차분하게', type: 'emotion', tradeType: 'buy' },  // 차분함
  { id: 24, name: '#확신한다', type: 'emotion', tradeType: 'buy' },  // 확신
  { id: 25, name: '#포모왔다', type: 'emotion', tradeType: 'buy' },  // 조급함
  { id: 26, name: '#더먹고싶다', type: 'emotion', tradeType: 'buy' },  // 욕심
  { id: 27, name: '#불안하지만', type: 'emotion', tradeType: 'buy' },  // 불안함
  { id: 28, name: '#평정심', type: 'emotion', tradeType: 'buy' },  // 냉정함
  { id: 29, name: '#오를것같다', type: 'emotion', tradeType: 'buy' },  // 낙관
  { id: 30, name: '#다들사니까', type: 'emotion', tradeType: 'buy' },  // 공포매수

  // 매도 감정 (Emotion - Sell)
  { id: 31, name: '#팔고나니홀가분', type: 'emotion', tradeType: 'sell' }, // 안도감
  { id: 32, name: '#대박났다', type: 'emotion', tradeType: 'sell' }, // 환희
  { id: 33, name: '#계획대로됐다', type: 'emotion', tradeType: 'sell' }, // 평온
  { id: 34, name: '#기다린보람', type: 'emotion', tradeType: 'sell' }, // 인내성공
  { id: 35, name: '#조금더기다릴걸', type: 'emotion', tradeType: 'sell' }, // 아쉬움
  { id: 36, name: '#왜팔았지', type: 'emotion', tradeType: 'sell' }, // 후회
  { id: 37, name: '#멘탈나갔다', type: 'emotion', tradeType: 'sell' }, // 좌절
  { id: 38, name: '#겁나서팔았다', type: 'emotion', tradeType: 'sell' }, // 공포매도
  { id: 39, name: '#흔들리지않았다', type: 'emotion', tradeType: 'sell' }, // 침착함
  { id: 40, name: '#열받아서팔았다', type: 'emotion', tradeType: 'sell' }, // 분노매도
];

// ─────────────────────────────────────────────
// useTagStore Hook
// 거래 유형(buy/sell)에 따라 필터링된 태그를 반환합니다.
// ─────────────────────────────────────────────

export const useTagStore = (tradeType: 'buy' | 'sell' = 'buy') => {
  const strategyTags = ALL_TAGS.filter(t => t.type === 'strategy' && (t.tradeType === tradeType || t.tradeType === 'both'));
  const emotionTags = ALL_TAGS.filter(t => t.type === 'emotion' && (t.tradeType === tradeType || t.tradeType === 'both'));

  return {
    strategyTags,
    emotionTags,
  };
};
