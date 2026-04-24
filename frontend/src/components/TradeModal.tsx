import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTradeStore } from '../store/tradeStore';
import { loadStockMasterCSV } from '../utils/csv';
import type { StockData } from '../utils/csv';
import { useTagStore } from '../store/tagStore';
import { usePrincipleStore } from '../store/principleStore';
import { PrincipleCheckModal } from './PrincipleCheckModal';
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

  const { strategyTags, emotionTags } = useTagStore(formData.type);
  // 원칙 확인 모달 상태 및 원칙 로드
  const { fetchPrinciples } = usePrincipleStore();
  const [isPrincipleCheckOpen, setIsPrincipleCheckOpen] = useState(false);

  // 모달이 열릴 때 최신 원칙을 로드해서 PrincipleCheckModal에서 바로 사용할 수 있게 함
  useEffect(() => {
    if (isOpen) {
      fetchPrinciples();
      setFormData((prev: any) => ({ ...prev, tradedAt: getKSTNow() }));
    } else {
      // 모달이 닫힐 때 내부 상태들을 초기화하여 다음 번 열릴 때 깨끗한 상태 유지
      setIsPrincipleCheckOpen(false);
      setError('');
    }
  }, [isOpen, fetchPrinciples]);

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
        const filtered = stocks.filter((s: StockData) => 
          s.symbol.toLowerCase().includes(lowerQuery) || 
          s.nameKo.toLowerCase().includes(lowerQuery) || 
          s.nameEn.toLowerCase().includes(lowerQuery)
        ).slice(0, 20);
        setStockResults(filtered);
        if (filtered.length > 0) setShowStockDropdown(true);
      } catch (err) {
        console.error('[Search] Failed to search stocks locally', err);
      }
    }, 150);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    if (name === 'ticker' || name === 'name') {
      setActiveInput(name as 'ticker' | 'name');
      searchStocks(value);
    }
  };

  const handleTypeChange = (type: 'buy' | 'sell') => {
    setFormData((prev: any) => ({
      ...prev,
      type,
      strategyTag: '',
      emotionTag: ''
    }));
  };

  const handleTagClick = (category: 'strategy' | 'emotion', tagName: string) => {
    const field = category === 'strategy' ? 'strategyTag' : 'emotionTag';
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field] === tagName ? '' : tagName
    }));
  };

  const getStockDisplayName = (stock: any) => {
    if (['US', 'NASDAQ', 'NYSE', 'AMEX'].includes(stock.marketCode) && stock.nameEn) return stock.nameEn;
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        tradedAt: new Date(formData.tradedAt).toISOString(),
        strategyTag: formData.strategyTag || null,
        emotionTag: formData.emotionTag || null,
        memo: formData.memo || null,
        isPublic: formData.isPublic
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '매매 내역 저장에 실패했습니다.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 저장 버튼 클릭 시 PrincipleCheckModal을 먼저 열어 원칙 확인 후 실제 저장을 실행한다.
   * 왜 handleSaveClick인가:
   * - handleSubmit을 직접 호출하면 원칙 확인 단계를 건너뜀
   * - 이 함수가 '게이트키퍼' 역할을 하여 항상 원칙 확인 → 저장 순서를 보장
   */
  const handleSaveClick = () => {
    // 기본 유효성 검사 (폼 제출 전 확인)
    if (!formData.ticker || !formData.name) {
      setError('종목을 선택해주세요.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError('단가를 입력해주세요.');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError('수량을 입력해주세요.');
      return;
    }
    setError('');
    setIsPrincipleCheckOpen(true);
  };

  const totalAmount = Number(formData.price || 0) * Number(formData.quantity || 0);

  // ✅ [수정] 모든 Hook 호출 이후, 렌더링 직전에 조기 리턴을 배치합니다.
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container trade-modal-v2" onClick={e => e.stopPropagation()}>
        <div className="modal-header header-inline">
          <h2>매매 내역</h2>
          <div className="header-actions">
            <button className="text-btn cancel" onClick={onClose}>취소</button>
            <button className="text-btn save" onClick={handleSaveClick} disabled={isSubmitting}>
              {isSubmitting ? '...' : '저장'}
            </button>
          </div>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <div className="trade-form-content">
          {/* 매수/매도 토글 */}
          <div className="type-toggle-container">
            <div className="type-toggle">
              <button 
                type="button"
                className={`type-btn buy ${formData.type === 'buy' ? 'active' : ''}`}
                onClick={() => handleTypeChange('buy')}
              >
                매수 BUY
              </button>
              <button 
                type="button"
                className={`type-btn sell ${formData.type === 'sell' ? 'active' : ''}`}
                onClick={() => handleTypeChange('sell')}
              >
                매도 SELL
              </button>
            </div>
          </div>

          <div className="form-grid" ref={dropdownRef}>
            <div className="form-group autocomplete-container">
              <label htmlFor="trade-ticker-id">종목코드</label>
              <input 
                id="trade-ticker-id"
                type="text" 
                name="ticker"
                value={formData.ticker} 
                onChange={handleChange} 
                placeholder="005930" 
                autoComplete="off" 
                onFocus={() => { setActiveInput('ticker'); if(formData.ticker) searchStocks(formData.ticker); }} 
                aria-label="종목코드 입력"
              />
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
              <label htmlFor="trade-name-id">종목명</label>
              <input 
                id="trade-name-id"
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
                placeholder="삼성전자" 
                autoComplete="off" 
                onFocus={() => { setActiveInput('name'); if(formData.name) searchStocks(formData.name); }} 
                aria-label="종목명 입력"
              />
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

            <div className="form-group">
              <label htmlFor="trade-price-id">단가 (Price)</label>
              <input 
                id="trade-price-id"
                type="number" 
                name="price"
                value={formData.price} 
                onChange={handleChange} 
                placeholder="70000" 
                step="any"
                aria-label="단가 입력"
              />
            </div>
            <div className="form-group">
              <label htmlFor="trade-quantity-id">수량 (Quantity)</label>
              <input 
                id="trade-quantity-id"
                type="number" 
                name="quantity"
                value={formData.quantity} 
                onChange={handleChange} 
                placeholder="10" 
                step="any"
                aria-label="수량 입력"
              />
            </div>
          </div>

          <div className="total-amount-section">
            <span className="total-label">총 체결금액</span>
            <div className="total-value">
              {Math.round(totalAmount).toLocaleString()}<span>원</span>
            </div>
          </div>

          <div className="date-section">
            <label htmlFor="trade-date-id">체결 일시</label>
            <div className="date-input-wrapper">
              <input 
                id="trade-date-id"
                type="datetime-local" 
                name="tradedAt"
                value={formData.tradedAt} 
                onChange={handleChange} 
                aria-label="체결 일시 선택"
              />
              <span className="calendar-icon">📅</span>
            </div>
          </div>

          {/* 전략 태그 */}
          <div className="tag-section">
            <label>전략 태그</label>
            <div className="tag-list">
              {strategyTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-chip ${formData.strategyTag === tag.name ? 'active' : ''}`}
                  onClick={() => handleTagClick('strategy', tag.name)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 감정 태그 */}
          <div className="tag-section">
            <label>감정 태그</label>
            <div className="tag-list">
              {emotionTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-chip ${formData.emotionTag === tag.name ? 'active' : ''}`}
                  onClick={() => handleTagClick('emotion', tag.name)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="trade-memo-id">자유 메모 (선택)</label>
            <textarea 
              id="trade-memo-id"
              name="memo"
              value={formData.memo} 
              onChange={handleChange} 
              placeholder="매매에 대한 생각이나 근거를 기록하세요." 
              rows={2} 
              aria-label="매매 메모 입력"
            />
          </div>

          <div className="checkbox-group-v2">
            <input type="checkbox" id="isPublicV2" name="isPublic" checked={formData.isPublic} onChange={handleChange} />
            <label htmlFor="isPublicV2">커뮤니티에 공개하기</label>
          </div>
        </div>
      </div>

      {/* 원칙 확인 모달 — TradeModal 위에 표시 (z-index: 3000) */}
      <PrincipleCheckModal
        isOpen={isPrincipleCheckOpen}
        onConfirm={() => {
          setIsPrincipleCheckOpen(false);
          handleSubmit(); // 원칙 확인 후 실제 거래 저장 실행
        }}
        onCancel={() => setIsPrincipleCheckOpen(false)}
      />
    </div>,
    document.body
  );
};
