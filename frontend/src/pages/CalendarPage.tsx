import React, { useEffect, useMemo, useState } from 'react';
import { useTradeStore } from '../store/tradeStore';
import './CalendarPage.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const fetchTrades = useTradeStore(state => state.fetchTrades);
  const trades = useTradeStore(state => state.trades);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch trades on component mount in case it wasn't fetched yet
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
    
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    let totalMonthlyPnl = 0;
    let profitDaysCount = 0;
    let lossDaysCount = 0;
    let totalActiveDays = 0;
    
    const days = [];
    
    for (let day = 1; day <= totalDays; day++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateString = `${year}-${mm}-${dd}`;
      
      const dayTrades = trades.filter(t => t.traded_at && t.traded_at.startsWith(dateString));
      const dailyPnl = Math.floor(dayTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0));
      
      if (dayTrades.length > 0) {
        totalActiveDays++;
        if (dailyPnl > 0) profitDaysCount++;
        else if (dailyPnl < 0) lossDaysCount++;
        totalMonthlyPnl += dailyPnl;
      }
      
      days.push({
        day,
        dateString,
        pnl: dailyPnl,
        hasTrades: dayTrades.length > 0,
        sign: dailyPnl > 0 ? 'profit' : dailyPnl < 0 ? 'loss' : 'zero'
      });
    }

    const avgDailyPnl = totalActiveDays > 0 ? Math.floor(totalMonthlyPnl / totalActiveDays) : 0;
    
    return { 
      year, 
      month: month + 1, 
      startingDayOfWeek, 
      days,
      summary: {
        totalMonthlyPnl,
        profitDaysCount,
        lossDaysCount,
        avgDailyPnl
      }
    };
  }, [trades, currentDate]);

  const formatCompact = (num: number) => {
    if (num === 0) return '';
    return num >= 10000 ? `+${(num/10000).toFixed(0)}만` : num <= -10000 ? `-${Math.abs(num)/10000}만` : num > 0 ? `+${num}` : num.toString();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const activeDayTrades = useMemo(() => {
    if (!selectedDate) return [];
    return trades.filter(t => t.traded_at && t.traded_at.startsWith(selectedDate));
  }, [selectedDate, trades]);

  return (
    <div className="calendar-page animate-fade-in">
      <header className="page-header calendar-header-top">
        <h1>수익 캘린더</h1>
        <div className="month-navigation glass-panel">
          <button onClick={handlePrevMonth} className="nav-btn"><ChevronLeft size={20} /> {calendarData.month === 1 ? 12 : calendarData.month - 1}월</button>
          <span className="current-month-display">{calendarData.year}년 {calendarData.month}월</span>
          <button onClick={handleNextMonth} className="nav-btn">{calendarData.month === 12 ? 1 : calendarData.month + 1}월 <ChevronRight size={20} /></button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="summary-card glass-panel">
          <span className="summary-label">이달 총 손익</span>
          <span className={`summary-value ${calendarData.summary.totalMonthlyPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
            {calendarData.summary.totalMonthlyPnl > 0 ? '+' : ''}{calendarData.summary.totalMonthlyPnl.toLocaleString()}
          </span>
        </div>
        <div className="summary-card glass-panel">
          <span className="summary-label">수익일</span>
          <span className="summary-value profit-text">{calendarData.summary.profitDaysCount}일</span>
        </div>
        <div className="summary-card glass-panel">
          <span className="summary-label">손실일</span>
          <span className="summary-value loss-text">{calendarData.summary.lossDaysCount}일</span>
        </div>
        <div className="summary-card glass-panel">
          <span className="summary-label">일평균 손익</span>
          <span className={`summary-value ${calendarData.summary.avgDailyPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
            {calendarData.summary.avgDailyPnl > 0 ? '+' : ''}{calendarData.summary.avgDailyPnl.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="calendar-grid glass-panel">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        
        {Array.from({ length: calendarData.startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-cell empty"></div>
        ))}

        {calendarData.days.map((data) => (
          <div 
            key={data.day} 
            onClick={() => setSelectedDate(data.dateString)}
            className={`calendar-cell ${data.hasTrades ? data.sign + '-bg' : 'empty-bg'} ${selectedDate === data.dateString ? 'selected' : ''}`}
          >
            <span className={`day-number ${data.hasTrades ? 'has-trades' : ''}`}>{data.day}</span>
            <div className={`day-pnl ${data.hasTrades ? (data.sign === 'profit' ? 'profit-text' : data.sign === 'loss' ? 'loss-text' : '') : ''}`}>
              {formatCompact(data.pnl)}
            </div>
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <span className="legend-item"><span className="legend-color profit-bg"></span>수익</span>
        <span className="legend-item"><span className="legend-color loss-bg"></span>손실</span>
        <span className="legend-item"><span className="legend-color empty-bg"></span>거래없음</span>
      </div>

      {selectedDate && (
        <div className="day-detail-panel glass-panel animate-fade-in">
          <h3>{selectedDate} 매매 내역</h3>
          {activeDayTrades.length === 0 ? (
            <p className="text-muted" style={{marginTop: '1rem'}}>해당 날짜에 매매 내역이 없습니다.</p>
          ) : (
            <div className="detail-trades-list">
              {activeDayTrades.map((t, idx) => (
                <div key={idx} className={`detail-trade-item ${t.type === 'buy' ? 'border-buy' : 'border-sell'}`}>
                  <div className="detail-trade-info">
                    <span className={`trade-type ${t.type}`}>{t.type === 'buy' ? '매수' : '매도'}</span>
                    <span className="trade-name">{t.name}</span>
                    <span className="trade-price">{Number(t.price).toLocaleString()}원</span>
                    <span className="trade-qty">({Number(t.quantity)}주)</span>
                  </div>
                  {t.type === 'sell' && t.pnl !== null && (
                    <div className="detail-trade-pnl">
                      <span className={Number(t.pnl) >= 0 ? 'profit-text' : 'loss-text'}>
                        {Number(t.pnl) > 0 ? '+' : ''}{Math.floor(Number(t.pnl)).toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
