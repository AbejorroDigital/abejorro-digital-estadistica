import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left + rect.width / 2,
        top: rect.top - 6 // Small gap above the element
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className="inline-block cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none flex flex-col items-center"
          style={{
            left: `${coords.left}px`,
            top: `${coords.top}px`,
            transform: 'translate(-50%, -100%)' // Center horizontally, positioning above top coord
          }}
        >
          <div className="relative z-10 rounded-md bg-slate-900 p-2 text-xs text-white shadow-xl text-center leading-relaxed w-48 border border-slate-700">
            {content}
          </div>
          {/* Arrow pointing down */}
          <div className="h-2 w-2 -translate-y-1 rotate-45 bg-slate-900 border-r border-b border-slate-700"></div>
        </div>,
        document.body
      )}
    </div>
  );
};
