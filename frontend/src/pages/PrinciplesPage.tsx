import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePrincipleStore } from '../store/principleStore';

import { HelpTooltip } from '../components/ui/HelpTooltip';

// ─────────────────────────────────────────────
// 원칙은 최대 5개
// ─────────────────────────────────────────────
const MAX_PRINCIPLES = 5;

/** 편집 중인 원칙 항목 (임시 상태용) */
interface DraftPrinciple {
  id?: string;       // 서버에 저장된 경우 존재
  order_num: number;
  content: string;
}

export const PrinciplesPage: React.FC = () => {
  const { principles, isLoading, error, fetchPrinciples, savePrinciples, clearError } =
    usePrincipleStore();

  // 로컬 편집 상태 (서버의 principles를 편집 가능한 draft로 복사)
  const [drafts, setDrafts] = useState<DraftPrinciple[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 마운트 시 서버에서 원칙 로드
  useEffect(() => {
    fetchPrinciples();
  }, [fetchPrinciples]);

  // 서버 데이터가 바뀌면 draft와 동기화
  useEffect(() => {
    if (principles.length > 0) {
      setDrafts(
        principles.map((p) => ({ id: p.id, order_num: p.order_num, content: p.content }))
      );
    } else {
      // 원칙이 없으면 빈 입력 1개를 기본으로 보여줌
      setDrafts([{ order_num: 1, content: '' }]);
    }
  }, [principles]);

  const handleAddPrinciple = () => {
    if (drafts.length >= MAX_PRINCIPLES) return;
    const nextOrderNum = drafts.length + 1;
    setDrafts((prev) => [...prev, { order_num: nextOrderNum, content: '' }]);
  };

  const handleRemovePrinciple = (index: number) => {
    const updated = drafts
      .filter((_, i) => i !== index)
      // order_num을 1부터 순서대로 재정렬
      .map((p, i) => ({ ...p, order_num: i + 1 }));
    setDrafts(updated);
  };

  const handleContentChange = (index: number, value: string) => {
    setDrafts((prev) => prev.map((p, i) => (i === index ? { ...p, content: value } : p)));
  };

  const handleSave = async () => {
    // 빈 content 필터링 후 저장
    const toSave = drafts
      .filter((d) => d.content.trim() !== '')
      .map((d, i) => ({ order_num: i + 1, content: d.content.trim() }));

    if (toSave.length === 0) return;

    setIsSaving(true);
    setSaveSuccess(false);
    clearError();

    try {
      await savePrinciples(toSave);
      setSaveSuccess(true);
      // 2초 후 성공 메시지 숨김
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // error state는 store에서 관리
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in pb-32">
      {/* 헤더 */}
      <header className="mb-10 space-y-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center">
              나의 투자 원칙
              <HelpTooltip content="투자 시 감정에 휘둘리지 않도록 나만의 매매 원칙을 세우고 관리하세요. 매매 기록 시 자동으로 체크리스트가 표시됩니다." className="ml-2" iconSize={24} />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              매매 전 확인하는 나만의 투자 철학을 최대 5개까지 작성하세요
            </p>
          </div>
        </div>

        {/* 성공 메시지 */}
        {saveSuccess && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 size={16} />
            투자 원칙이 저장되었습니다.
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-500/20">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </header>

      {/* 원칙 입력 목록 */}
      {isLoading && drafts.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft, index) => (
            <div
              key={index}
              className="card-fintech p-5 bg-white dark:bg-bg-card animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                {/* 순서 번호 뱃지 */}
                <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-lg flex items-center justify-center">
                  {index + 1}
                </div>

                {/* 텍스트 입력 */}
                <textarea
                  rows={2}
                  className="flex-1 resize-none bg-transparent border-b border-gray-100 dark:border-white/10 focus:border-amber-400 dark:focus:border-amber-400 outline-none text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 transition-colors py-1"
                  placeholder={`원칙 ${index + 1}번을 입력하세요 (예: 손절 라인을 미리 정하고 진입한다)`}
                  value={draft.content}
                  onChange={(e) => handleContentChange(index, e.target.value)}
                  aria-label={`투자 원칙 ${index + 1}번`}
                  id={`principle-input-${index + 1}`}
                />

                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => handleRemovePrinciple(index)}
                  className="shrink-0 p-2 text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  aria-label={`원칙 ${index + 1}번 삭제`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* 원칙 추가 버튼 */}
          {drafts.length < MAX_PRINCIPLES && (
            <button
              type="button"
              onClick={handleAddPrinciple}
              className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl hover:border-amber-300 hover:text-amber-500 dark:hover:border-amber-500/50 dark:hover:text-amber-400 transition-all"
              aria-label="투자 원칙 추가"
            >
              <Plus size={18} />
              원칙 추가 ({drafts.length}/{MAX_PRINCIPLES})
            </button>
          )}
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || drafts.every((d) => d.content.trim() === '')}
          className="w-full py-4 flex items-center justify-center gap-2 text-base font-black rounded-2xl bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save size={20} />
              원칙 저장하기
            </>
          )}
        </button>
      </div>

      {/* 안내 문구 */}
      <p className="mt-6 text-center text-[11px] text-gray-300 dark:text-gray-600 font-medium">
        저장된 원칙은 매매 기록 시 확인 모달에서 자동으로 표시됩니다
      </p>
    </div>
  );
};
