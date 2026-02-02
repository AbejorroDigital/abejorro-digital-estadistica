import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden w-48 flex-col items-center group-hover:flex z-50">
        <div className="relative z-10 rounded-md bg-gray-900 p-2 text-xs text-white shadow-lg text-center leading-relaxed">
          {content}
        </div>
        <div className="h-2 w-2 -translate-y-1 rotate-45 bg-gray-900"></div>
      </div>
    </div>
  );
};