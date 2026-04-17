import React, { useState } from 'react';
import { CompoundCalculator } from '../components/calculators/CompoundCalculator';
import { DividendCalculator } from '../components/calculators/DividendCalculator';
import { ValuationCalculator } from '../components/calculators/ValuationCalculator';
import { RiskRewardCalculator } from '../components/calculators/RiskRewardCalculator';
import { Calculator, TrendingUp, DollarSign, BarChart3, Scale } from 'lucide-react';

// TierGate 목업 (추후 주석 제거로 활성화 가능)
/*
import { TierGate } from '../components/TierGate';
*/

type TabId = 'compound' | 'dividend' | 'valuation' | 'rr';

const TABS = [
  { id: 'compound', label: '복리 수익률', icon: <TrendingUp size={16} /> },
  { id: 'dividend', label: '배당 수익률', icon: <DollarSign size={16} /> },
  { id: 'valuation', label: '적정 주가', icon: <BarChart3 size={16} /> },
  { id: 'rr', label: '리스크 비율', icon: <Scale size={16} /> },
] as const;

export const CalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('compound');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-32">
      <header className="mb-10 text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
          <Calculator size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tight">투자 시뮬레이터</h1>
        <p className="text-gray-500 font-medium">다양한 관점에서 분석하고 최적의 진입 시점을 결정하세요</p>
      </header>

      {/* 탭 내비게이션 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 p-1.5 bg-gray-50 dark:bg-white/5 rounded-2xl w-fit mx-auto border border-gray-100 dark:border-white/5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800 dark:bg-victory-gold text-white dark:text-ink shadow-lg scale-[1.05]'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 계산기 렌더링 영역 */}
      <div className="relative">
        {/* TierGate 주석 처리 구조 예시
        <TierGate feature="calculators">
        */}
        
        {activeTab === 'compound' && <CompoundCalculator />}
        {activeTab === 'dividend' && <DividendCalculator />}
        {activeTab === 'valuation' && <ValuationCalculator />}
        {activeTab === 'rr' && <RiskRewardCalculator />}
        
        {/* </TierGate> */}
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] opacity-50">
          AntStockNote Strategic Simulation Suite
        </p>
      </footer>
    </div>
  );
};
