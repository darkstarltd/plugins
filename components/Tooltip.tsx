
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  return (
    <div className="group relative flex items-center">
      {children}
      <span className={`custom-tooltip absolute w-auto p-2 text-xs leading-tight text-white bg-gray-800 border border-gray-900 rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]}`}>
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
