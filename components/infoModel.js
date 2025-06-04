import React, { useState, useRef, useEffect } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';

const InfoModel = ({ children, tooltipContent }) => {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const delayTimeout = useRef(null);

  const { refs, floatingStyles, update } = useFloating({
    placement: 'top',
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const handleMouseEnter = () => {
    delayTimeout.current = setTimeout(() => {
      setVisible(true);
    }, 300); // Delay appearance
  };

  const handleMouseLeave = () => {
    clearTimeout(delayTimeout.current);
    setVisible(false);
    setShowTooltip(false); // Hide after fade
  };

  // Wait until floating UI has calculated position, then fade
  useEffect(() => {
    if (visible&&tooltipContent) {
      const cleanup = autoUpdate(
        refs.reference.current,
        refs.floating.current,
        update
      );
      requestAnimationFrame(() => {
        setShowTooltip(true); // fade-in now
      });
      return () => cleanup();
    }
  }, [visible, refs.reference, refs.floating, update]);

  return (
    <div
      ref={refs.setReference}
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className={`
          z-50
          w-64
          p-3
          border border-gray-700
          rounded-lg shadow-xl
          bg-gray-900 text-white text-sm
          space-y-2
          transition-all duration-300 ease-out
          pointer-events-none
          ${visible && showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
      >
        {tooltipContent}
      </div>
    </div>
  );
};

export default InfoModel;
