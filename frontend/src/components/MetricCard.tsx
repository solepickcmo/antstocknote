import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, trend }) => {
  return (
    <div className="glass-panel metric-card animate-fade-in">
      <div className="metric-title">{title}</div>
      <div className={`metric-value ${trend === 'up' ? 'profit-text' : trend === 'down' ? 'loss-text' : ''}`}>
        {value}
      </div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );
};
