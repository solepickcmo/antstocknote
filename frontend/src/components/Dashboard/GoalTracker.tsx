import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';
import { useTradeStore } from '../../store/tradeStore';

export const GoalTracker: React.FC = () => {
  const { currentGoal, fetchGoal, updateGoal } = useGoalStore();
  const trades = useTradeStore(state => state.trades);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM
  
  // 이번 달 수익금 계산
  const monthlyPnl = trades
    .filter(t => t.type === 'sell' && t.traded_at.startsWith(currentMonth))
    .reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);

  useEffect(() => {
    fetchGoal(currentMonth);
  }, [currentMonth, fetchGoal]);

  const handleSave = async () => {
    const val = parseInt(editValue.replace(/[^0-9]/g, ''));
    if (!isNaN(val)) {
      await updateGoal(currentMonth, val);
      setIsEditing(false);
    }
  };

  const targetPnl = currentGoal?.target_pnl || 0;
  const progress = targetPnl > 0 ? Math.min(100, Math.max(0, (monthlyPnl / targetPnl) * 100)) : 0;

  return (
    <div className="card-fintech group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight">{now.getMonth() + 1}월 수익 목표</h3>
            <p className="text-[10px] text-muted font-medium uppercase tracking-widest mt-0.5">Monthly Goal Tracking</p>
          </div>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => {
              setEditValue(targetPnl.toString());
              setIsEditing(true);
            }}
            className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors"
          >
            <Edit2 size={14} />
          </button>
        ) : (
          <div className="flex gap-1">
            <button onClick={handleSave} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg">
              <Check size={14} />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] text-muted font-bold uppercase">현재 달성액</p>
            <p className={`text-xl font-black ${monthlyPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {monthlyPnl.toLocaleString()}원
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] text-muted font-bold uppercase">목표 금액</p>
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                className="bg-ink/50 border border-amber-500/30 rounded-md px-2 py-1 text-sm font-bold text-right w-32 focus:outline-none focus:border-amber-500"
                placeholder="목표 입력"
              />
            ) : (
              <p className="text-sm font-black text-white">
                {targetPnl > 0 ? `${targetPnl.toLocaleString()}원` : '목표 없음'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-muted uppercase">달성률</span>
            <span className="text-amber-500">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {targetPnl > 0 && monthlyPnl >= targetPnl && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3 animate-bounce-subtle">
            <div className="text-green-500">
              <TrendingUp size={16} />
            </div>
            <p className="text-[11px] font-bold text-green-400">축하합니다! 이번 달 목표를 달성했습니다! 🚀</p>
          </div>
        )}
      </div>
    </div>
  );
};
