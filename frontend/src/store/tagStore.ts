// ─────────────────────────────────────────────
// tagStore.ts
// 전략 태그와 감정 태그를 관리하는 스토어입니다.
// 태그는 고정된 10개 항목으로 제공되며, 사용자 커스텀 추가/삭제 기능은 제공하지 않습니다.
// (DB 조회 없이 로컬 상수에서 즉시 로드하여 성능 및 안정성 향상)
// ─────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  type: 'strategy' | 'emotion';
}

interface TagState {
  strategyTags: Tag[];
  emotionTags: Tag[];
}

// ─────────────────────────────────────────────
// 고정 태그 정의 (각 10개)
// 매매 전략/감정 분석에 가장 많이 쓰이는 범용 태그로 구성
// ─────────────────────────────────────────────

export const STRATEGY_TAGS: Tag[] = [
  { id: 1,  name: '#돌파매매',  type: 'strategy' },
  { id: 2,  name: '#눌림목',    type: 'strategy' },
  { id: 3,  name: '#시가베팅',  type: 'strategy' },
  { id: 4,  name: '#종가베팅',  type: 'strategy' },
  { id: 5,  name: '#추세추종',  type: 'strategy' },
  { id: 6,  name: '#수급매매',  type: 'strategy' },
  { id: 7,  name: '#박스권',    type: 'strategy' },
  { id: 8,  name: '#낙주매매',  type: 'strategy' },
  { id: 9,  name: '#재료매매',  type: 'strategy' },
  { id: 10, name: '#하이리스크', type: 'strategy' },
];

export const EMOTION_TAGS: Tag[] = [
  { id: 11, name: '#자신감',  type: 'emotion' },
  { id: 12, name: '#설렘',    type: 'emotion' },
  { id: 13, name: '#불안감',  type: 'emotion' },
  { id: 14, name: '#공포',    type: 'emotion' },
  { id: 15, name: '#차분함',  type: 'emotion' },
  { id: 16, name: '#욕심',    type: 'emotion' },
  { id: 17, name: '#환희',    type: 'emotion' },
  { id: 18, name: '#좌절',    type: 'emotion' },
  { id: 19, name: '#인내심',  type: 'emotion' },
  { id: 20, name: '#냉정함',  type: 'emotion' },
];

// ─────────────────────────────────────────────
// useTagStore Hook
// Zustand 불필요 - 고정 데이터이므로 단순 상수 export로 대체
// 기존 컴포넌트 인터페이스 호환을 위해 동일한 형태 유지
// ─────────────────────────────────────────────

export const useTagStore = (): TagState => {
  return {
    strategyTags: STRATEGY_TAGS,
    emotionTags: EMOTION_TAGS,
  };
};
