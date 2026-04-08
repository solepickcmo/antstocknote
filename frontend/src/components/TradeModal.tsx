import React, { useState } from 'react';
import { useTradeStore } from '../store/tradeStore';
import './TradeModal.css';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

export const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, accountId }) => {
  const createTrade = useTradeStore((state) => state.createTrade);
  
  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    type: 'buy',
    price: '',
    quantity: '',
    fee: '0',
    tradedAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    strategyTag: '',
    emotionTag: '',
    memo: '',
    isPublic: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createTrade({
        accountId: Number(accountId),
        ticker: formData.ticker,
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        fee: Number(formData.fee),
        tradedAt: new Date(formData.tradedAt).toISOString(),
        strategyTag: formData.strategyTag || null,
        emotionTag: formData.emotionTag || null,
        memo: formData.memo || null,
        isPublic: formData.isPublic
      });
      onClose(); // Close on success
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '매매 기록 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>새 매매 기록</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="trade-form">
          <div className="form-row">
            <div className="form-group">
              <label>종목코드</label>
              <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} required placeholder="005930" />
            </div>
            <div className="form-group">
              <label>종목명</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="삼성전자" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>유형</label>
              <select name="type" value={formData.type} onChange={handleChange} className={formData.type}>
                <option value="buy">매수 (Buy)</option>
                <option value="sell">매도 (Sell)</option>
              </select>
            </div>
            <div className="form-group">
              <label>체결 일시</label>
              <input type="datetime-local" name="tradedAt" value={formData.tradedAt} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>단가 (Price)</label>
              <input type="number" step="0.0001" name="price" value={formData.price} onChange={handleChange} required placeholder="70000" />
            </div>
            <div className="form-group">
              <label>수량 (Quantity)</label>
              <input type="number" step="0.00000001" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="10" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>전략 태그 (선택)</label>
              <input type="text" name="strategyTag" value={formData.strategyTag} onChange={handleChange} placeholder="e.g. 추세추종" />
            </div>
            <div className="form-group">
              <label>감정 태그 (선택)</label>
              <input type="text" name="emotionTag" value={formData.emotionTag} onChange={handleChange} placeholder="e.g. 확신" />
            </div>
          </div>

          <div className="form-group">
            <label>자유 메모 (선택)</label>
            <textarea name="memo" value={formData.memo} onChange={handleChange} placeholder="매매에 대한 생각이나 근거를 기록하세요." rows={3}></textarea>
          </div>
          
          <div className="checkbox-group">
            <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} />
            <label htmlFor="isPublic">커뮤니티에 공개하기</label>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>취소</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '기록 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
