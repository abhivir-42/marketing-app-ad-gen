import React, { useState, useCallback, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseEnter = useCallback(() => {
    clearTimeoutRef();
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent | MouseEvent) => {
    // Check if we're moving between the trigger and tooltip
    if (tooltipRef.current && triggerRef.current) {
      const tooltipElement = tooltipRef.current;
      const triggerElement = triggerRef.current;
      const relatedTarget = e.relatedTarget as Node;

      if (
        tooltipElement.contains(relatedTarget) ||
        triggerElement.contains(relatedTarget)
      ) {
        return;
      }
    }

    clearTimeoutRef();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150); // Slightly longer delay
  }, []);

  useEffect(() => {
    return () => clearTimeoutRef();
  }, []);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="p-2 -m-2" // Larger padding area
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute z-10 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg tooltip dark:bg-gray-700"
          style={{
            top: '-3rem', // More space between tooltip and trigger
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
          <div
            className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700"
            style={{
              bottom: '-0.25rem',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip; 