import React, { useState } from 'react';
import { Calculator as CalcIcon, Droplets, Target, Layers } from 'lucide-react';
import { WateringCalculator } from '../components/calculators/WateringCalculator';
import { GoalReverseCalculator } from '../components/calculators/GoalReverseCalculator';
import { BEPCalculator } from '../components/calculators/BEPCalculator';
import './CalculatorPage.css';

type CalcTab = 'watering' | 'goal' | 'bep';

export const CalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcTab>('watering');

  const tabs = [
    { id: 'watering', label: '물타기', icon: <Droplets size={18} /> },
    { id: 'goal', label: '목표 수익', icon: <Target size={18} /> },
    { id: 'bep', label: '분할 매수', icon: <Layers size={18} /> },
  ];

  return (
    <div className="calculator-page animate-fade-in p-4 md:p-6 bg-gray-50 min-h-screen">
      <header className="page-header mb-8">
        <div className="header-title-row flex items-center gap-3">
          <div className="icon-box bg-primary p-2 rounded-xl text-gray-900 shadow-lg shadow-primary/20">
            <CalcIcon size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">매매 계산기</h1>
        </div>
        <p className="text-gray-400 mt-2 font-medium">성공적인 트레이딩을 위한 도구를 활용해보세요.</p>
      </header>

      {/* 탭 네비게이션 */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 mb-8 max-w-2xl mx-auto overflow-x-auto no-scrollbar gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CalcTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm whitespace-nowrap px-4 ${
              activeTab === tab.id
                ? 'bg-gray-900 text-primary shadow-md scale-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 scale-[0.98]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 계산기 컴포넌트 조건부 렌더링 */}
      <main className="transition-all duration-500 transform">
        {activeTab === 'watering' && <WateringCalculator />}
        {activeTab === 'goal' && <GoalReverseCalculator />}
        {activeTab === 'bep' && <BEPCalculator />}
      </main>
    </div>
  );
};
