import React, { useState, useEffect, useRef } from 'react';
import { useTradeStore } from '../store/tradeStore';
import { useTagStore } from '../store/tagStore';
import { loadStockMasterCSV } from '../utils/csv';
import type { StockData } from '../utils/csv';

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

  // 매수/매도 유형에 따라 필터링된 고정 태그 목록 가져오기
  const { strategyTags, emotionTags } = useTagStore(formData.type);

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
        
        setStockResults(filtered);
        setShowStockDropdown(true);
      } catch (err) {
        console.error('Failed to search stocks locally', err);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header-mobile">
          <h2>매매 내역</h2>
          <div className="header-actions">
            <button type="button" className="btn-cancel-top" onClick={onClose} disabled={isSubmitting}>취소</button>
            <button type="submit" form="tradeForm" className="btn-save-top" disabled={isSubmitting}>저장</button>
          </div>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <form id="tradeForm" onSubmit={handleSubmit} className="trade-form">
          <div className="segment-control">
            <button type="button" className={`segment-btn buy ${formData.type === 'buy' ? 'active' : ''}`} onClick={() => setFormData((prev: any) => ({...prev, type: 'buy', strategyTag: '', emotionTag: ''}))}>매수 BUY</button>
            <button type="button" className={`segment-btn sell ${formData.type === 'sell' ? 'active' : ''}`} onClick={() => setFormData((prev: any) => ({...prev, type: 'sell', strategyTag: '', emotionTag: ''}))}>매도 SELL</button>
          </div>
          <div className="form-row" ref={dropdownRef}>
            <div className="form-group autocomplete-container">
              <label>종목코드</label>
              <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} required placeholder="005930" autoComplete="off" onFocus={() => { setActiveInput('ticker'); if(formData.ticker) searchStocks(formData.ticker); }} />
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
              <label>종목명</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="삼성전자" autoComplete="off" onFocus={() => { setActiveInput('name'); if(formData.name) searchStocks(formData.name); }} />
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
              <label>단가 (Price)</label>
              <input type="number" step="1" name="price" value={formData.price} onChange={handleChange} required placeholder="70000" />
            </div>
            <div className="form-group">
              <label>수량 (Quantity)</label>
              <input type="number" step="0.00000001" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="10" />
            </div>
          </div>

          <div className="form-row-single">
            <div className="form-group">
              <label>총 체결금액</label>
              <input type="text" readOnly value={(Number(formData.price) * Number(formData.quantity)).toLocaleString()} className="readonly-input highlight" />
            </div>
          </div>
          <div className="form-row-single">
            <div className="form-group">
              <label>체결 일시</label>
              <input type="datetime-local" name="tradedAt" value={formData.tradedAt} onChange={handleChange} required />
            </div>
          </div>
          
          
          <div className="form-group block-group">
            <div className="tag-selector">
              {strategyTags.map((tag) => (
                <div key={tag.id} className="tag-chip-container">
                  <button 
                    type="button" 
                    className={`sel-chip ${formData.strategyTag === tag.name ? 'active' : ''}`}
                    onClick={() => setFormData((prevFormData: any) => ({...prevFormData, strategyTag: prevFormData.strategyTag === tag.name ? '' : tag.name}))}
                  >
                     {tag.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group block-group">
            <div className="tag-selector">
              {emotionTags.map((tag) => (
                <div key={tag.id} className="tag-chip-container">
                  <button 
                    type="button" 
                    className={`sel-chip ${formData.emotionTag === tag.name ? 'active' : ''}`}
                    onClick={() => setFormData((prevFormData: any) => ({...prevFormData, emotionTag: prevFormData.emotionTag === tag.name ? '' : tag.name}))}
                  >
                     {tag.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>자유 메모 (선택)</label>
            <textarea name="memo" value={formData.memo} onChange={handleChange} placeholder="매매에 대한 생각이나 근거를 기록하세요." rows={3}></textarea>
          </div>
          
          <div className="checkbox-group tooltip-wrapper mobile-toggle-wrapper">
             <span style={{fontWeight: 600}}>커뮤니티 공개</span>
             <label className="switch">
                <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} disabled />
                <span className="slider round"></span>
             </label>
          </div>
        </form>
      </div>
    </div>
  );
};
