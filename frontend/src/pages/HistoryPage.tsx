import React from 'react';
import { DesktopHistoryView } from './DesktopHistoryView';
import { MobileHistoryView } from './MobileHistoryView';
import { useLayoutStore } from '../store/layoutStore';
import { useTradeStore } from '../store/tradeStore';

export const HistoryPage: React.FC = () => {
  const isMobileMode = useLayoutStore(state => state.isMobileMode);
  // TradeModal 열기 함수 — 모바일/PC 양쪽 뷰 모두 동일한 함수를 주입
  const setModalOpen = useTradeStore(state => state.setModalOpen);
  const openModal = () => setModalOpen(true);
  
  if (isMobileMode) {
    return <MobileHistoryView onRecordClick={openModal} />;
  }
  
  return <DesktopHistoryView onRecordClick={openModal} />;
};
