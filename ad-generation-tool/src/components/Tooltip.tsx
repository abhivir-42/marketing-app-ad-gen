import React, { useState, useCallback } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(true);
  }, [timeoutId]);

  const handleMouseLeave = useCallback(() => {
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 100); // Small delay before hiding
    setTimeoutId(id);
  }, []);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="p-1 -m-1" // Add padding but offset it with negative margin
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 -top-10 left-1/2 transform -translate-x-1/2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {text}
          <div className="tooltip-arrow absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1" />
        </div>
      )}
    </div>
  );
};

export default Tooltip; 