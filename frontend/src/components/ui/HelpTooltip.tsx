import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconSize?: number;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  position = 'top', 
  className = '',
  iconSize = 16 
}) => {
  return (
    <Tooltip content={content} position={position} className={className}>
      <div className="text-gray-400 hover:text-primary transition-colors cursor-help inline-flex items-center ml-1.5 focus:outline-none flex-shrink-0">
        <HelpCircle size={iconSize} />
      </div>
    </Tooltip>
  );
};
