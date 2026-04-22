import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { usePrincipleStore } from '../store/principleStore';
import { useNavigate } from 'react-router-dom';

interface PrincipleCheckModalProps {
  isOpen: boolean;
  onConfirm: () => void;   // "원칙에 따라 매매했습니다" → 거래 저장 진행
  onCancel: () => void;    // 취소 → 거래 저장 안 함, 모달 닫기
}

/**
 * 매매 기록 저장 직전에 표시되는 원칙 확인 모달.
 *
 * 케이스 분기:
 * 1. 원칙 있음 → 원칙 목록을 보여주고 "거래했나요?" 확인
 * 2. 원칙 없음 → 원칙 작성 안내 + 페이지 이동 or 스킵
 */
export const PrincipleCheckModal: React.FC<PrincipleCheckModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const principles = usePrincipleStore((s) => s.principles);
  const hasPrinciples = principles.length > 0;
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToPrinciples = () => {
    onCancel(); // TradeModal 닫기
    navigate('/principles');
  };

  return (
    // 오버레이 — z-index를 TradeModal보다 높게 (3000)
    <div
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      role="dialog"
      aria-modal="true"
      aria-label="투자 원칙 확인"
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-bg-card rounded-3xl shadow-2xl overflow-hidden animate-[modal-enter_0.2s_ease]">

        {/* 케이스 1: 원칙이 있을 때 */}
        {hasPrinciples ? (
          <>
            <div className="px-6 pt-7 pb-2">
              <h2 className="text-xl font-black mb-1">투자 원칙 확인</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                이 거래가 아래 원칙에 따라 이루어졌나요?
              </p>
            </div>

            {/* 원칙 목록 */}
            <div className="px-6 py-4 space-y-3 max-h-60 overflow-y-auto">
              {principles.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20"
                >
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                    {p.content}
                  </p>
                </div>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="px-6 pb-7 space-y-2">
              <button
                onClick={onConfirm}
                className="w-full py-3.5 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                id="principle-confirm-btn"
              >
                <CheckCircle2 size={18} />
                네, 원칙에 따라 거래했습니다
              </button>
              <button
                onClick={onCancel}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                id="principle-cancel-btn"
              >
                <X size={16} />
                취소 (거래 저장 안 함)
              </button>
            </div>
          </>
        ) : (
          /* 케이스 2: 원칙이 없을 때 */
          <>
            <div className="px-6 pt-7 pb-4 text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black">투자 원칙이 없습니다</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                나만의 투자 원칙을 먼저 작성하면<br />
                매매 시 스스로를 냉정하게 점검할 수 있습니다.
              </p>
            </div>

            <div className="px-6 pb-7 space-y-2">
              <button
                onClick={handleGoToPrinciples}
                className="w-full py-3.5 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-sm rounded-xl transition-all"
                id="go-to-principles-btn"
              >
                투자 원칙 작성하러 가기
                <ArrowRight size={16} />
              </button>
              <button
                onClick={onConfirm}
                className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                id="skip-principle-btn"
              >
                건너뛰고 거래 저장
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
