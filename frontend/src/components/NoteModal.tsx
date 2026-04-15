import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import './TradeModal.css';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTrades();
    }
  }, [isOpen]);

  // Supabase에서 직접 매도 거래만 조회 (RLS 적용됨)
  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('type', 'sell')
        .order('traded_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setTrades(data || []);
      if (data && data.length > 0) {
        setSelectedTradeId(String(data[0].id));
      }
    } catch (err) {
      console.error('매도 거래 목록 조회 실패', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTradeId || !content) return;

    setIsSubmitting(true);
    setError('');

    try {
      const selectedTrade = trades.find(t => String(t.id) === selectedTradeId);
      // strategy_tag를 mistakeType으로 활용 (SDD FR-062 기준)
      const mistakeType = selectedTrade?.strategy_tag || '';

      // notes 테이블에 upsert (trade_id에 unique 제약)
      const { error: upsertError } = await supabase
        .from('notes')
        .upsert(
          { trade_id: Number(selectedTradeId), mistake_type: mistakeType, content },
          { onConflict: 'trade_id' }
        );

      if (upsertError) throw upsertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '오답 노트 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>오답 노트 작성</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="trade-form">
          <div className="form-group full-width">
            <label>대상 매매 선택</label>
            <select
              value={selectedTradeId}
              onChange={e => setSelectedTradeId(e.target.value)}
              required
            >
              {trades.length === 0 && <option value="">매도 기록이 없습니다.</option>}
              {trades.map(t => (
                <option key={t.id} value={t.id}>
                  {new Date(t.traded_at).toLocaleDateString()} - {t.name} ({t.ticker}) {t.pnl < 0 ? '손실' : '수익'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label>오답 내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="무엇이 아쉬웠는지, 다음에는 어떻게 다르게 행동할 것인지 적어보세요."
              rows={5}
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>취소</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '노트 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
