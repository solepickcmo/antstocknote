import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

/**
 * [프론트엔드 UI 영향 범위]
 * 이 훅은 대시보드(DashboardPage) 및 통계 화면 등의 성과 분석 요약 섹션에서 
 * 사용자가 작성한 유효한 '오답노트' 개수를 렌더링하는데 사용됩니다.
 * 
 * [설계 의도 (Why)]
 * UI 컴포넌트인 DashboardPage 내부에 Supabase DB를 직접 접근하는 로직이 있으면,
 * 관심사 분리(Separation of Concerns) 원칙에 위배되며 추후 유지보수 시 데이터 소스
 * 구조가 바뀌었을 때 UI 파일까지 찾아 수정해야 하는 번거로움이 발생합니다.
 * 이 훅을 통해 데이터 패칭 로직을 완전히 캡슐화하고 UI 폴더 바깥으로 빼어, 컴포넌트를 
 * '보여주는(Presentational) 역할'로만 유지합니다.
 * 
 * @returns {number} content가 비어있지 않은 유효한 오답노트의 총 개수
 */
export const useNotesCount = (): number => {
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    const fetchNotesCount = async () => {
      // content IS NOT NULL AND content != '' 조건 적용해 빈 노트는 제외
      const { count } = await supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .not('content', 'is', null)
        .neq('content', '');
        
      setNotesCount(count ?? 0);
    };
    
    fetchNotesCount();
  }, []);

  return notesCount;
};
