import React from 'react';
import './CalendarPage.css';

const MOCK_CALENDAR = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  let pnl = 0;
  if (day % 4 === 0) pnl = -50000;
  else if (day % 3 === 0) pnl = 150000;
  else if (day === 15) pnl = 1200000;
  
  return {
    day,
    pnl,
    sign: pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'zero'
  };
});

export const CalendarPage: React.FC = () => {
  const formatCompact = (num: number) => {
    if (num === 0) return '';
    return num > 10000 ? `+${(num/10000).toFixed(0)}만` : `-${Math.abs(num)/10000}만`;
  };

  return (
    <div className="calendar-page animate-fade-in">
      <header className="page-header">
        <h1>수익 캘린더</h1>
        <p className="text-muted">2026년 4월</p>
      </header>

      <div className="calendar-grid">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="calendar-header">{day}</div>
        ))}
        
        {/* Placeholder for offset days */}
        <div className="calendar-cell empty"></div>
        <div className="calendar-cell empty"></div>
        <div className="calendar-cell empty"></div>

        {MOCK_CALENDAR.map((data) => (
          <div key={data.day} className={`calendar-cell ${data.sign !== 'zero' ? data.sign + '-bg' : ''}`}>
            <span className="day-number">{data.day}</span>
            <div className={`day-pnl ${data.sign === 'profit' ? 'profit-text' : 'loss-text'}`}>
              {formatCompact(data.pnl)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
