import React, { useState, useEffect, useRef } from 'react';
import { useTradeStore } from '../store/tradeStore';
import { useLayoutStore } from '../store/layoutStore';
import { apiClient } from '../api/client';
import './TradeModal.css';

const BUY_STRATEGY_TAGS = [
  { value: "#돌파매매", label: "#돌파매매 - 주요 저항선을 돌파하는 시점에 매수" },
  { value: "#눌림목매매", label: "#눌림목매매 - 상승 추세 중 일시적 조정 구간에서 매수" },
  { value: "#시가베팅", label: "#시가베팅 - 장 초반 강한 수급을 확인하고 시가에 매수" },
  { value: "#종가베팅", label: "#종가베팅 - 다음 날 갭 상승을 기대하며 장 마감 직전 매수" },
  { value: "#재료/공시", label: "#재료/공시 - 특정 호재나 뉴스 공시를 바탕으로 매수" },
  { value: "#기술적반등", label: "#기술적반등 - 과매도 구간에서 기술적 반등을 노리고 매수" },
  { value: "#박스권하단", label: "#박스권하단 - 박스권 횡보 중 하단 지지선에서 매수" },
  { value: "#정배열초입", label: "#정배열초입 - 이평선들이 정배열로 확산되는 초입에 매수" },
  { value: "#수급매매", label: "#수급매매 - 외인이나 기관의 강한 매집을 확인 후 매수" },
  { value: "#추세추종", label: "#추세추종 - 살아있는 우상향 추세에 올라타는 매수" }
];

const BUY_EMOTION_TAGS = [
  "#자신감", "#조급함(FOMO)", "#설렘", "#불안감", "#차분함", "#확신", "#호기심", "#압박감", "#욕심", "#공포"
];

const SELL_STRATEGY_TAGS = [
  { value: "#목표가도달", label: "#목표가도달 - 미리 설정한 수익 목표가에서 익절" },
  { value: "#손절선이탈", label: "#손절선이탈 - 미리 정한 손절 가격을 터치하여 기계적 매도" },
  { value: "#트레일링스탑", label: "#트레일링스탑 - 고점 대비 일정 비율 하락 시 수익 보전 매도" },
  { value: "#분할익절", label: "#분할익절 - 리스크 관리를 위해 수익권에서 물량 일부 매도" },
  { value: "#시간손절", label: "#시간손절 - 예상한 시간 내에 시세가 나지 않아 기회비용 차원 매도" },
  { value: "#추세이탈", label: "#추세이탈 - 유지되던 상승 추세선이 꺾일 때 매도" },
  { value: "#재료소멸", label: "#재료소멸 - 호재가 선반영되었거나 뉴스가 발표된 직후 매도" },
  { value: "#리스크관리", label: "#리스크관리 - 지수 급락 등 시장 위험으로 인한 비중 축소" },
  { value: "#고점신호", label: "#고점신호 - 보조지표상 과매수 혹은 캔들상 고점 신호 시 매도" },
  { value: "#종목교체", label: "#종목교체 - 더 매력적인 다른 종목을 사기 위한 매도" }
];

const SELL_EMOTION_TAGS = [
  "#후련함", "#아쉬움", "#기쁨", "#자책", "#무덤덤함", "#안도감", "#억울함", "#만족감", "#당혹감", "#인내"
];

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose }) => {
  const createTrade = useTradeStore((state) => state.createTrade);
  const isMobileMode = useLayoutStore((state) => state.isMobileMode);
  
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
        const response = await apiClient.get(`/stocks/search?q=${encodeURIComponent(query)}`);
        setStockResults(response.data);
        setShowStockDropdown(true);
      } catch (err) {
        console.error('Failed to search stocks', err);
      }
    }, 300);
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        strategyTag: '',
        emotionTag: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
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

  const handleStockSelect = (stock: any) => {
    setFormData(prev => ({
      ...prev,
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
        tradedAt: new Date(formData.tradedAt).toISOString(),
        strategyTag: formData.strategyTag || null,
        emotionTag: formData.emotionTag || null,
        memo: formData.memo || null,
        isPublic: formData.isPublic
      });
      onClose(); // Close on success
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '매매 내역 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={e => e.stopPropagation()}>
        <div className={isMobileMode ? "modal-header-mobile" : "modal-header"}>
          {isMobileMode ? (
            <>
              <h2>매매 내역</h2>
              <div className="header-actions">
                <button type="button" className="btn-cancel-top" onClick={onClose} disabled={isSubmitting}>취소</button>
                <button type="button" className="btn-save-top" onClick={handleSubmit} disabled={isSubmitting}>저장</button>
              </div>
            </>
          ) : (
            <>
              <h2>새 매매 내역</h2>
              <button type="button" className="close-btn" onClick={onClose}>&times;</button>
            </>
          )}
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="trade-form">
          {isMobileMode && (
            <div className="segment-control">
              <button type="button" className={`segment-btn buy ${formData.type === 'buy' ? 'active' : ''}`} onClick={() => setFormData(prev => ({...prev, type: 'buy', strategyTag: '', emotionTag: ''}))}>매수 BUY</button>
              <button type="button" className={`segment-btn sell ${formData.type === 'sell' ? 'active' : ''}`} onClick={() => setFormData(prev => ({...prev, type: 'sell', strategyTag: '', emotionTag: ''}))}>매도 SELL</button>
            </div>
          )}
          <div className="form-row" ref={dropdownRef}>
            <div className="form-group autocomplete-container">
              <label>종목코드</label>
              <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} required placeholder="005930" autoComplete="off" onFocus={() => { setActiveInput('ticker'); if(formData.ticker) searchStocks(formData.ticker); }} />
              {showStockDropdown && activeInput === 'ticker' && stockResults.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {stockResults.map(stock => (
                    <li key={`${stock.marketCode}-${stock.symbol}`} onClick={() => handleStockSelect(stock)}>
                      <div className="stock-info">
                        <span className="stock-name">{getStockDisplayName(stock)}</span>
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
                  {stockResults.map(stock => (
                    <li key={`${stock.marketCode}-${stock.symbol}`} onClick={() => handleStockSelect(stock)}>
                      <div className="stock-info">
                        <span className="stock-name">{stock.nameKo}</span>
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
          </div>
          
          {!isMobileMode && (
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
          )}
          
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

          {isMobileMode ? (
            <>
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
            </>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>총 체결금액</label>
                <input type="text" readOnly value={(Number(formData.price) * Number(formData.quantity)).toLocaleString()} className="readonly-input highlight" />
              </div>
            </div>
          )}
          
          
          {isMobileMode ? (
            <>
              <div className="form-group block-group">
                <label>전략 태그</label>
                <div className="tag-selector">
                  {(formData.type === 'buy' ? BUY_STRATEGY_TAGS : SELL_STRATEGY_TAGS).map((tag) => {
                    const tagShort = tag.value.split('-')[0].trim();
                    return (
                      <button type="button" key={tag.value} className={`sel-chip ${formData.strategyTag === tag.value ? 'active' : ''}`} onClick={() => setFormData(f => ({...f, strategyTag: f.strategyTag === tag.value ? '' : tag.value}))}>
                         {tagShort}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group block-group">
                <label>감정 태그</label>
                <div className="tag-selector">
                  {(formData.type === 'buy' ? BUY_EMOTION_TAGS : SELL_EMOTION_TAGS).map((tag) => (
                    <button type="button" key={tag} className={`sel-chip ${formData.emotionTag === tag ? 'active' : ''}`} onClick={() => setFormData(f => ({...f, emotionTag: f.emotionTag === tag ? '' : tag}))}>
                       {tag}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>전략 태그 (선택)</label>
                <select name="strategyTag" value={formData.strategyTag} onChange={handleChange}>
                  <option value="">선택안함</option>
                  {formData.type === 'buy' 
                    ? BUY_STRATEGY_TAGS.map(tag => <option key={tag.value} value={tag.value}>{tag.label}</option>)
                    : SELL_STRATEGY_TAGS.map(tag => <option key={tag.value} value={tag.value}>{tag.label}</option>)
                  }
                </select>
              </div>
              <div className="form-group">
                <label>감정 태그 (선택)</label>
                <select name="emotionTag" value={formData.emotionTag} onChange={handleChange}>
                  <option value="">선택안함</option>
                  {formData.type === 'buy'
                    ? BUY_EMOTION_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)
                    : SELL_EMOTION_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)
                  }
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>자유 메모 (선택)</label>
            <textarea name="memo" value={formData.memo} onChange={handleChange} placeholder="매매에 대한 생각이나 근거를 기록하세요." rows={3}></textarea>
          </div>
          
          {isMobileMode ? (
            <div className="checkbox-group tooltip-wrapper mobile-toggle-wrapper">
               <span style={{fontWeight: 600}}>커뮤니티 공개</span>
               <label className="switch">
                  <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} disabled />
                  <span className="slider round"></span>
               </label>
            </div>
          ) : (
            <div className="checkbox-group tooltip-wrapper">
              <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} disabled />
              <label htmlFor="isPublic" style={{ color: 'var(--text-muted)' }}>커뮤니티에 공개하기 (현재 비활성화됨)</label>
            </div>
          )}
          
          {/* 하단 모달 액션 (상단 헤더 버튼으로 이동한 경우 모바일은 숨김) */}
          <div className="modal-actions" style={{display: isMobileMode ? 'none' : 'flex'}}>
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>취소</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '매매 내역 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
