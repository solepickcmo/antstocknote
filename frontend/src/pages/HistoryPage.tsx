import React from 'react';
import { DesktopHistoryView } from './DesktopHistoryView';
import { MobileHistoryView } from './MobileHistoryView';
import { useLayoutStore } from '../store/layoutStore';

export const HistoryPage: React.FC = () => {
  const isMobileMode = useLayoutStore(state => state.isMobileMode);
  
  if (isMobileMode) {
    return <MobileHistoryView />;
  }
  
  return <DesktopHistoryView />;
};
