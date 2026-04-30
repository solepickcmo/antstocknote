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
  // 매수 감정 (Buy - Blue)
  { id: 1, name: '확신', type: 'emotion', tradeType: 'buy' },
  { id: 2, name: '설렘', type: 'emotion', tradeType: 'buy' },
  { id: 3, name: '기대감', type: 'emotion', tradeType: 'buy' },
  { id: 4, name: 'FOMO', type: 'emotion', tradeType: 'buy' },
  { id: 5, name: '욕심', type: 'emotion', tradeType: 'buy' },
  { id: 6, name: '조급함', type: 'emotion', tradeType: 'buy' },
  { id: 7, name: '용기', type: 'emotion', tradeType: 'buy' },
  { id: 8, name: '불안반신', type: 'emotion', tradeType: 'buy' },
  { id: 9, name: '직감', type: 'emotion', tradeType: 'buy' },
  { id: 10, name: '평정심', type: 'emotion', tradeType: 'buy' },

  // 매수 전략 (Buy - Green)
  { id: 11, name: '분할매수', type: 'strategy', tradeType: 'buy' },
  { id: 12, name: '저점공략', type: 'strategy', tradeType: 'buy' },
  { id: 13, name: '추세추종', type: 'strategy', tradeType: 'buy' },
  { id: 14, name: '역발상', type: 'strategy', tradeType: 'buy' },
  { id: 15, name: '눌림목', type: 'strategy', tradeType: 'buy' },
  { id: 16, name: '이평돌파', type: 'strategy', tradeType: 'buy' },
  { id: 17, name: '뉴스매수', type: 'strategy', tradeType: 'buy' },
  { id: 18, name: '물타기', type: 'strategy', tradeType: 'buy' },
  { id: 19, name: '장기보유', type: 'strategy', tradeType: 'buy' },
  { id: 20, name: '스캘핑', type: 'strategy', tradeType: 'buy' },

  // 매도 감정 (Sell - Red)
  { id: 21, name: '공포', type: 'emotion', tradeType: 'sell' },
  { id: 22, name: '후회', type: 'emotion', tradeType: 'sell' },
  { id: 23, name: '안도감', type: 'emotion', tradeType: 'sell' },
  { id: 24, name: '미련', type: 'emotion', tradeType: 'sell' },
  { id: 25, name: '패닉', type: 'emotion', tradeType: 'sell' },
  { id: 26, name: '자책', type: 'emotion', tradeType: 'sell' },
  { id: 27, name: '냉정함', type: 'emotion', tradeType: 'sell' },
  { id: 28, name: '손절각오', type: 'emotion', tradeType: 'sell' },
  { id: 29, name: '탐욕유지', type: 'emotion', tradeType: 'sell' },
  { id: 30, name: '홀가분', type: 'emotion', tradeType: 'sell' },

  // 매도 전략 (Sell - Orange)
  { id: 31, name: '분할매도', type: 'strategy', tradeType: 'sell' },
  { id: 32, name: '손절매', type: 'strategy', tradeType: 'sell' },
  { id: 33, name: '목표익절', type: 'strategy', tradeType: 'sell' },
  { id: 34, name: '고점탈출', type: 'strategy', tradeType: 'sell' },
  { id: 35, name: '트레일링', type: 'strategy', tradeType: 'sell' },
  { id: 36, name: '뉴스매도', type: 'strategy', tradeType: 'sell' },
  { id: 37, name: '리밸런싱', type: 'strategy', tradeType: 'sell' },
  { id: 38, name: '반전매도', type: 'strategy', tradeType: 'sell' },
  { id: 39, name: '전량청산', type: 'strategy', tradeType: 'sell' },
  { id: 40, name: '존버포기', type: 'strategy', tradeType: 'sell' },
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
