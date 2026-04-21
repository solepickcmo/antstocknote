import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTradeStore } from '../store/tradeStore';
import { loadStockMasterCSV } from '../utils/csv';
import type { StockData } from '../utils/csv';
import './TradeModal.css';

// 기본 헬퍼: 현재 시간을 KST(UTC+9) 문자열로 변환 (datetime-local 형식)
const getKSTNow = () => {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().slice(0, 16);
};

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose }) => {
  const createTrade = useTradeStore((state: any) => state.createTrade);
  // 고정 태그 목록 (추가/삭제 없이 읽기 전용으로 사용)
  const [formData, setFormData] = useState<{
    ticker: string;
    name: string;
    type: 'buy' | 'sell';
    price: string;
    quantity: string;
    fee: string;
    tradedAt: string;
    strategyTag: string;
    emotionTag: string;
    memo: string;
    isPublic: boolean;
  }>({
    ticker: '',
    name: '',
    type: 'buy',
    price: '',
    quantity: '',
    fee: '0',
    tradedAt: '',
    strategyTag: '',
    emotionTag: '',
    memo: '',
    isPublic: false
  });

  // 모달 열릴 때 날짜를 현재 KST 시각으로 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData((prev: any) => ({ ...prev, tradedAt: getKSTNow() }));
    }
  }, [isOpen]);

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [stockResults, setStockResults] = useState<any[]>([]);
  const [showStockDropdown, setShowStockDropdown] = useState(false);
  const [activeInput, setActiveInput] = useState<'ticker' | 'name' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStockDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchStocks = async (query: string) => {
    if (!query || query.length < 1) {
      setStockResults([]);
      setShowStockDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const stocks = await loadStockMasterCSV();
        const lowerQuery = query.toLowerCase();
        
        // Local filtering
        const filtered = stocks.filter((s: StockData) => 
          s.symbol.toLowerCase().includes(lowerQuery) || 
          s.nameKo.toLowerCase().includes(lowerQuery) || 
          s.nameEn.toLowerCase().includes(lowerQuery)
        ).slice(0, 20); // Limit to top 20 results
        
        // console.log(`[Search] query: "${query}", found: ${filtered.length} stocks`);
        
        setStockResults(filtered);
        if (filtered.length > 0) {
          setShowStockDropdown(true);
        }
      } catch (err) {
        console.error('[Search] Failed to search stocks locally', err);
      }
    }, 150); // Reduced delay since it's local
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'type') {
      // [name]: value 동적 키 방식은 TypeScript가 type 필드를 string으로 추론하므로
      // 명시적 필드명과 타입 단언으로 처리한다.
      setFormData((prev: any) => ({
        ...prev,
        type: value as 'buy' | 'sell',
        strategyTag: '',
        emotionTag: ''
      }));
      return;
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    if (name === 'ticker' || name === 'name') {
      setActiveInput(name as 'ticker' | 'name');
      searchStocks(value);
    }
  };

  const getStockDisplayName = (stock: any) => {
    if (['US', 'NASDAQ', 'NYSE', 'AMEX'].includes(stock.marketCode) && stock.nameEn) {
      return stock.nameEn;
    }
    return stock.nameKo || stock.nameEn;
  };

  const handleStockSelect = (stock: StockData) => {
    setFormData((prevData: any) => ({
      ...prevData,
      ticker: stock.symbol,
      name: getStockDisplayName(stock)
    }));
    setShowStockDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createTrade({
        ticker: formData.ticker,
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        fee: Number(formData.fee),
        // KST 입력값을 UTC로 변환하여 전송
        tradedAt: new Date(formData.tradedAt).toISOString(),
        strategyTag: formData.strategyTag || null,
        emotionTag: formData.emotionTag || null,
        memo: formData.memo || null,
        isPublic: formData.isPublic
      });
      onClose(); // Close on success
    } catch (err: any) {
      const msg = err.response?.data?.message
        || err.message
        || '매매 내역 저장에 실패했습니다.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>새 매매 기록</h2>
          <button className="close-x" onClick={onClose} aria-label="닫기">&times;</button>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <form id="tradeForm" onSubmit={handleSubmit} className="trade-form">
          <div className="form-row" ref={dropdownRef}>
            <div className="form-group autocomplete-container">
              <label className="label-fintech" id="label-ticker" htmlFor="ticker">종목코드</label>
              <input aria-label="종목 코드 입력" id="ticker" type="text" name="ticker" className="input-fintech" value={formData.ticker} onChange={handleChange} required placeholder="005930" autoComplete="off" onFocus={() => { setActiveInput('ticker'); if(formData.ticker) searchStocks(formData.ticker); }} aria-labelledby="label-ticker" />
              {showStockDropdown && activeInput === 'ticker' && stockResults.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {stockResults.map((stock: StockData) => (
                    <li key={`${stock.marketCode}-${stock.symbol}`} onClick={() => handleStockSelect(stock)}>
                      <div className="stock-info">
                        <span className="stock-symbol">{stock.symbol}</span>
                      </div>
                      <div className="stock-meta">
                        <span className="market-badge">{stock.marketCode}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group autocomplete-container">
              <label className="label-fintech" id="label-stockName" htmlFor="stockName">종목명</label>
              <input aria-label="종목명 입력" id="stockName" type="text" name="name" className="input-fintech" value={formData.name} onChange={handleChange} required placeholder="애플" autoComplete="off" onFocus={() => { setActiveInput('name'); if(formData.name) searchStocks(formData.name); }} aria-labelledby="label-stockName" />
              {showStockDropdown && activeInput === 'name' && stockResults.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {stockResults.map((stock: StockData) => (
                    <li key={`${stock.marketCode}-${stock.symbol}`} onClick={() => handleStockSelect(stock)}>
                      <div className="stock-info">
                        <span className="stock-name">{stock.nameKo}</span>
                      </div>
                      <div className="stock-meta">
                        <span className="market-badge">{stock.marketCode}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="label-fintech" id="label-type" htmlFor="type">유형</label>
              <select aria-label="매매 유형 선택" id="type" name="type" className="input-fintech" value={formData.type} onChange={handleChange} required aria-labelledby="label-type">
                <option value="buy">매수 (Buy)</option>
                <option value="sell">매도 (Sell)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label-fintech" id="label-tradedAt" htmlFor="tradedAt">체결 일시</label>
              <input aria-label="체결 일시 선택" id="tradedAt" type="datetime-local" name="tradedAt" className="input-fintech" value={formData.tradedAt} onChange={handleChange} required aria-labelledby="label-tradedAt" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label-fintech" id="label-price" htmlFor="price">단가 (Price)</label>
              <input aria-label="매수가격(단가) 입력" id="price" type="number" step="any" name="price" className="input-fintech" value={formData.price} onChange={handleChange} required placeholder="70000" aria-labelledby="label-price" />
            </div>
            <div className="form-group">
              <label className="label-fintech" id="label-quantity" htmlFor="quantity">수량 (Quantity)</label>
              <input aria-label="매수수량 입력" id="quantity" type="number" step="any" name="quantity" className="input-fintech" value={formData.quantity} onChange={handleChange} required placeholder="10" aria-labelledby="label-quantity" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label-fintech" id="label-strategyTag" htmlFor="strategyTag">전략 태그 (선택)</label>
              <input aria-label="전략 태그 입력" id="strategyTag" type="text" name="strategyTag" className="input-fintech" value={formData.strategyTag} onChange={handleChange} placeholder="e.g. 추세추종" aria-labelledby="label-strategyTag" />
            </div>
            <div className="form-group">
              <label className="label-fintech" id="label-emotionTag" htmlFor="emotionTag">감정 태그 (선택)</label>
              <input aria-label="감정 태그 입력" id="emotionTag" type="text" name="emotionTag" className="input-fintech" value={formData.emotionTag} onChange={handleChange} placeholder="e.g. 확신" aria-labelledby="label-emotionTag" />
            </div>
          </div>

          <div className="form-group">
            <label className="label-fintech" id="label-memo" htmlFor="memo">자유 메모 (선택)</label>
            <textarea aria-label="자유 메모 입력" id="memo" name="memo" className="input-fintech" value={formData.memo} onChange={handleChange} placeholder="매매에 대한 생각이나 근거를 기록하세요." rows={3} aria-labelledby="label-memo"></textarea>
          </div>
          
          <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px', marginBottom: '16px' }}>
            <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} style={{ width: '16px', height: '16px', minHeight: 'auto' }} />
            <label htmlFor="isPublic" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', marginBottom: 0 }}>커뮤니티에 공개하기</label>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-fintech-secondary whitespace-nowrap" onClick={onClose} disabled={isSubmitting}>취소</button>
            <button type="submit" form="tradeForm" className="btn-fintech-primary" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '기록 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
