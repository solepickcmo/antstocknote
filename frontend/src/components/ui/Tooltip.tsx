import React, { type ReactNode } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  /** 툴팁이 나타날 위치 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div className={`relative inline-flex items-center group ${className}`} tabIndex={0}>
      {children}
      <div 
        className={`absolute z-[100] invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 transition-all duration-200 pointer-events-none w-max max-w-[200px] sm:max-w-xs ${positionClasses[position]}`}
      >
        <div className="bg-gray-800 text-white text-xs rounded py-1.5 px-2.5 shadow-lg relative break-words whitespace-pre-wrap text-center font-normal leading-relaxed">
          {content}
          <div className={`absolute border-[5px] w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      </div>
    </div>
  );
};
