import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Save, Trash2, AlertCircle, FileText, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  useStockAnalysisStore,
  type StockAnalysis,
  type CreateAnalysisInput,
} from '../store/stockAnalysisStore';
import { loadStockMasterCSV } from '../utils/csv';
import type { StockData } from '../utils/csv';

// ─────────────────────────────────────────────
// Props 인터페이스
// ─────────────────────────────────────────────
interface StockAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 수정 모드: 기존 분석 데이터를 전달하면 편집 모드로 동작 */
  editTarget?: StockAnalysis;
  /** HoldingsPage에서 종목을 선택해 열 때 사전 설정 */
  presetTicker?: string;
  presetStockName?: string;
}

// ─────────────────────────────────────────────
// 날짜 포맷 헬퍼 (datetime-local input용)
// ─────────────────────────────────────────────
const toDatetimeLocal = (date: Date) => {
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(date.getTime() + kstOffset).toISOString().slice(0, 16);
};

export const StockAnalysisModal: React.FC<StockAnalysisModalProps> = ({
  isOpen,
  onClose,
  editTarget,
  presetTicker,
  presetStockName,
}) => {
  const { createAnalysis, updateAnalysis, deleteAnalysis, isLoading } = useStockAnalysisStore();

  // 폼 상태
  const [ticker, setTicker] = useState('');
  const [stockName, setStockName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [analysisDate, setAnalysisDate] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 종목 자동완성
  const [stockResults, setStockResults] = useState<StockData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEditMode = !!editTarget;

  // 모달 열릴 때 폼 초기화
  useEffect(() => {
    if (!isOpen) return;

    if (editTarget) {
      // 수정 모드: 기존 데이터로 채움
      setTicker(editTarget.ticker || '');
      setStockName(editTarget.stock_name || '');
      setTitle(editTarget.title);
      setContent(editTarget.content);
      setAnalysisDate(toDatetimeLocal(new Date(editTarget.analysis_date)));
    } else {
      // 신규 작성 모드
      setTicker(presetTicker || '');
      setStockName(presetStockName || '');
      setTitle('');
      setContent('');
      setAnalysisDate(toDatetimeLocal(new Date()));
    }
    setError('');
    setShowDeleteConfirm(false);
  }, [isOpen, editTarget, presetTicker, presetStockName]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 종목 검색 (TradeModal과 동일한 CSV 기반 검색 재사용)
  const searchStocks = (query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query || query.length < 1) {
      setStockResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const stocks = await loadStockMasterCSV();
        const lowerQuery = query.toLowerCase();
        const filtered = stocks
          .filter(
            (s: StockData) =>
              s.symbol.toLowerCase().includes(lowerQuery) ||
              s.nameKo.toLowerCase().includes(lowerQuery) ||
              s.nameEn.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 15);
        setStockResults(filtered);
        if (filtered.length > 0) setShowDropdown(true);
      } catch (e) {
        console.error('[StockAnalysisModal] 종목 검색 실패', e);
      }
    }, 150);
  };

  const handleTickerChange = (val: string) => {
    setTicker(val);
    searchStocks(val);
  };

  const handleStockSelect = (stock: StockData) => {
    setTicker(stock.symbol);
    const name =
      ['US', 'NASDAQ', 'NYSE', 'AMEX'].includes(stock.marketCode) && stock.nameEn
        ? stock.nameEn
        : stock.nameKo || stock.nameEn;
    setStockName(name);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('분석 내용을 입력해주세요.');
      return;
    }
    setError('');

    try {
      if (isEditMode && editTarget) {
        await updateAnalysis(editTarget.id, {
          title: title.trim(),
          content: content.trim(),
          analysis_date: new Date(analysisDate).toISOString(),
        });
      } else {
        const input: CreateAnalysisInput = {
          title: title.trim(),
          content: content.trim(),
          analysis_date: new Date(analysisDate).toISOString(),
        };
        if (ticker.trim()) input.ticker = ticker.trim();
        if (stockName.trim()) input.stock_name = stockName.trim();
        await createAnalysis(input);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || '저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!editTarget) return;
    try {
      await deleteAnalysis(editTarget.id);
      onClose();
    } catch {
      setError('삭제에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ animation: 'modal-enter 0.2s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-xl font-black">
            {isEditMode ? '분석 수정' : '종목 분석 기록'}
          </h2>
          <div className="flex items-center gap-2">
            {isEditMode && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-300 hover:text-red-400 rounded-xl transition-colors"
                aria-label="분석 삭제"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl transition-colors"
              aria-label="모달 닫기"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 삭제 확인 배너 */}
        {showDeleteConfirm && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl">
            <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">
              이 분석 기록을 삭제하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 py-2 text-xs font-bold bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-500/20">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* 폼 */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* 종목 검색 (수정 모드에서는 비활성) */}
          {!isEditMode && (
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                종목 (선택)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input-fintech h-11 pr-10"
                  placeholder="티커 또는 종목명 검색..."
                  value={ticker}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  aria-label="종목 검색"
                  id="stock-analysis-ticker-input"
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />

                {/* 자동완성 드롭다운 */}
                {showDropdown && stockResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-bg-card border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    {stockResults.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => handleStockSelect(stock)}
                        className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-white/5 last:border-0 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-amber-500">{stock.symbol}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {stock.nameKo || stock.nameEn}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 text-gray-400 px-2 py-0.5 rounded-md">
                          {stock.marketCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 선택된 종목 표시 */}
              {stockName && (
                <p className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <ChevronDown size={12} />
                  {stockName} · {ticker}
                </p>
              )}
            </div>
          )}

          {/* 수정 모드에서 종목명 표시 (읽기 전용) */}
          {isEditMode && (editTarget?.ticker || editTarget?.stock_name) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <span className="text-xs font-bold text-amber-500">{editTarget.ticker}</span>
              {editTarget.stock_name && (
                <span className="text-xs text-gray-500">{editTarget.stock_name}</span>
              )}
            </div>
          )}

          {/* 제목 */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="input-fintech h-11"
              placeholder="분석 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="분석 제목"
              id="stock-analysis-title-input"
            />
          </div>

          {/* 본문 */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <FileText size={12} />
              분석 내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              className="input-fintech resize-none"
              rows={8}
              placeholder={`분석 내용을 자유롭게 작성하세요.\n\n예시:\n- 매출 성장률 YoY +15%\n- PER 12배로 업종 평균 대비 저평가\n- 주요 리스크: 원자재 가격 상승`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              aria-label="분석 내용"
              id="stock-analysis-content-input"
            />
            <p className="text-[10px] text-gray-300 dark:text-gray-600 text-right">
              {content.length}자
            </p>
          </div>

          {/* 분석 날짜 */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              분석 날짜
            </label>
            <input
              type="datetime-local"
              className="input-fintech h-11"
              value={analysisDate}
              onChange={(e) => setAnalysisDate(e.target.value)}
              aria-label="분석 날짜"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            id="stock-analysis-save-btn"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                {isEditMode ? '수정 저장' : '분석 저장'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
