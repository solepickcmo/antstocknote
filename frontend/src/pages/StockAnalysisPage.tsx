import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, FileText, ChevronRight, X, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useStockAnalysisStore, type StockAnalysis } from '../store/stockAnalysisStore';
import { StockAnalysisModal } from '../components/StockAnalysisModal';

import { HelpTooltip } from '../components/ui/HelpTooltip';

export const StockAnalysisPage: React.FC = () => {
  const { analyses, total, isLoading, error, fetchAnalyses } = useStockAnalysisStore();

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockAnalysis | undefined>(undefined);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [tickerFilter, setTickerFilter] = useState('');

  // 상세 보기 (인라인 펼침)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 마운트 시 전체 분석 목록 로드
  useEffect(() => {
    fetchAnalyses({ ticker: tickerFilter || undefined });
  }, [fetchAnalyses, tickerFilter]);

  // 클라이언트 사이드 텍스트 검색 (제목, 종목명, 티커)
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return analyses;
    const q = searchQuery.toLowerCase();
    return analyses.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.stock_name?.toLowerCase().includes(q)) ||
        (a.ticker?.toLowerCase().includes(q))
    );
  }, [analyses, searchQuery]);

  // 종목별 티커 목록 (필터 칩용)
  const tickerList = useMemo(() => {
    const seen = new Set<string>();
    analyses.forEach((a) => { if (a.ticker) seen.add(a.ticker); });
    return Array.from(seen);
  }, [analyses]);

  const openCreate = () => {
    setEditTarget(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (analysis: StockAnalysis, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 펼침 이벤트 전파 차단
    setEditTarget(analysis);
    setIsModalOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in pb-32">
      {/* 헤더 */}
      <header className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center">
            종목 분석 기록
            <HelpTooltip content="관심 종목이나 보유 종목에 대한 정밀 분석 내용을 기록하고 보관할 수 있습니다." className="ml-2" iconSize={24} />
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            총 {total}개의 분석 기록
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-fintech-primary h-10 px-4 flex items-center gap-2 text-sm font-bold rounded-2xl bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20 transition-all"
          id="create-analysis-btn"
        >
          <Plus size={16} /> 새 분석
        </button>
      </header>

      {/* 검색 + 종목 필터 */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <input
            type="text"
            className="input-fintech h-11 pl-10"
            placeholder="제목, 종목명, 티커 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="분석 검색"
            id="analysis-search-input"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        </div>

        {/* 종목 필터 칩 */}
        {tickerList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setTickerFilter('')}
              className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                tickerFilter === ''
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              전체
            </button>
            {tickerList.map((t) => (
              <button
                key={t}
                onClick={() => setTickerFilter(tickerFilter === t ? '' : t)}
                className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                  tickerFilter === t
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
            {tickerFilter && (
              <button
                onClick={() => setTickerFilter('')}
                className="shrink-0 flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={12} /> 필터 해제
              </button>
            )}
          </div>
        )}
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* 로딩 */}
      {isLoading && analyses.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        /* 빈 상태 */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <FileText size={28} className="text-amber-500" />
          </div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
            {searchQuery || tickerFilter ? '검색 결과가 없습니다' : '아직 작성된 분석이 없습니다'}
          </p>
          {!searchQuery && !tickerFilter && (
            <button
              onClick={openCreate}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 underline underline-offset-2"
            >
              첫 번째 분석 기록 작성하기
            </button>
          )}
        </div>
      ) : (
        /* 분석 카드 목록 */
        <div className="space-y-3">
          {filtered.map((analysis) => (
            <div
              key={analysis.id}
              className="card-fintech bg-white dark:bg-bg-card cursor-pointer hover:border-amber-200 dark:hover:border-amber-500/30 transition-all"
              onClick={() => toggleExpand(analysis.id)}
            >
              {/* 카드 헤더 */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* 종목 뱃지 */}
                    {analysis.ticker && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md">
                          {analysis.ticker}
                        </span>
                        {analysis.stock_name && (
                          <span className="text-[11px] text-gray-400">{analysis.stock_name}</span>
                        )}
                      </div>
                    )}
                    {/* 제목 */}
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight truncate">
                      {analysis.title}
                    </p>
                    {/* 날짜 */}
                    <p className="text-[11px] text-gray-400 font-medium">
                      {format(new Date(analysis.analysis_date), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* 수정 버튼 */}
                    <button
                      onClick={(e) => openEdit(analysis, e)}
                      className="p-2 text-gray-300 hover:text-amber-500 rounded-xl transition-colors"
                      aria-label="분석 수정"
                    >
                      <Pencil size={15} />
                    </button>
                    {/* 펼치기 아이콘 */}
                    <ChevronRight
                      size={18}
                      className={`text-gray-300 transition-transform duration-200 ${
                        expandedId === analysis.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 펼쳐진 본문 */}
              {expandedId === analysis.id && (
                <div className="px-5 pb-5 border-t border-gray-50 dark:border-white/5 pt-4">
                  <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {analysis.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 분석 작성/편집 모달 */}
      <StockAnalysisModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTarget(undefined);
        }}
        editTarget={editTarget}
      />
    </div>
  );
};
