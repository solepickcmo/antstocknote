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
        
        console.log(`[Search] query: "${query}", found: ${filtered.length} stocks`);
        
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>매매 기록 추가</h2>
          <button className="close-x" onClick={onClose} aria-label="닫기">&times;</button>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <form id="tradeForm" onSubmit={handleSubmit} className="trade-form">
          <div className="segment-control">
            <button type="button" className={`segment-btn buy ${formData.type === 'buy' ? 'active' : ''}`} onClick={() => setFormData((prev: any) => ({...prev, type: 'buy', strategyTag: '', emotionTag: ''}))}>
              BUY <span>매수</span>
            </button>
            <button type="button" className={`segment-btn sell ${formData.type === 'sell' ? 'active' : ''}`} onClick={() => setFormData((prev: any) => ({...prev, type: 'sell', strategyTag: '', emotionTag: ''}))}>
              SELL <span>매도</span>
            </button>
          </div>
          <div className="form-row" ref={dropdownRef}>
            <div className="form-group autocomplete-container">
              <label className="label-fintech" id="label-ticker" htmlFor="ticker">종목코드</label>
              <input aria-label="종목 코드 입력" id="ticker" type="text" name="ticker" value={formData.ticker} onChange={handleChange} required placeholder="005930" autoComplete="off" onFocus={() => { setActiveInput('ticker'); if(formData.ticker) searchStocks(formData.ticker); }} aria-labelledby="label-ticker" />
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
              <input aria-label="종목명 입력" id="stockName" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="삼성전자" autoComplete="off" onFocus={() => { setActiveInput('name'); if(formData.name) searchStocks(formData.name); }} aria-labelledby="label-stockName" />
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
              <label className="label-fintech" id="label-price" htmlFor="price">단가 (Price)</label>
              <input aria-label="매수가격(단가) 입력" id="price" type="number" step="1" name="price" value={formData.price} onChange={handleChange} required placeholder="70000" aria-labelledby="label-price" />
            </div>
            <div className="form-group">
              <label className="label-fintech" id="label-quantity" htmlFor="quantity">수량 (Quantity)</label>
              <input aria-label="매수수량 입력" id="quantity" type="number" step="0.00000001" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="10" aria-labelledby="label-quantity" />
            </div>
          </div>

          <div className="form-row-single">
            <div className="form-group">
              <label className="label-fintech" id="label-totalAmount" htmlFor="totalAmount">총 체결금액</label>
              <input id="totalAmount" type="text" readOnly value={(Number(formData.price) * Number(formData.quantity)).toLocaleString()} className="readonly-input highlight" aria-labelledby="label-totalAmount" />
            </div>
          </div>
          <div className="form-row-single">
            <div className="form-group">
              <label className="label-fintech" id="label-tradedAt" htmlFor="tradedAt">체결 일시</label>
              <input aria-label="체결 일시 선택" id="tradedAt" type="datetime-local" name="tradedAt" value={formData.tradedAt} onChange={handleChange} required aria-labelledby="label-tradedAt" />
            </div>
          </div>
          
          
          <div className="form-group block-group">
            <label className="section-label">전략 태그</label>
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
            <label className="section-label">감정 태그</label>
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
            <label className="label-fintech" id="label-memo" htmlFor="memo">자유 메모 (선택)</label>
            <textarea aria-label="자유 메모 입력" id="memo" name="memo" value={formData.memo} onChange={handleChange} placeholder="매매에 대한 생각이나 근거를 기록하세요." rows={3} aria-labelledby="label-memo"></textarea>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-fintech-secondary" onClick={onClose} disabled={isSubmitting}>취소하고 돌아가기</button>
            <button type="submit" form="tradeForm" className="btn-fintech-primary" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '기록 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
