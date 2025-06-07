import React, { useState, useRef, useEffect } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';
import Tutorial from './tutorial';

const InfoModel = ({ video = "", children, tooltipContent }) => {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const delayTimeout = useRef(null);

  const { refs, floatingStyles, update } = useFloating({
    placement: 'top',
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  // Handle hover on both trigger and tooltip together
  const handleMouseEnter = () => {
    clearTimeout(delayTimeout.current);
    delayTimeout.current = setTimeout(() => {
      setVisible(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(delayTimeout.current);
    delayTimeout.current = setTimeout(() => {
      setVisible(false);
      setShowTooltip(false);
    }, 200);
  };

  useEffect(() => {
    if (visible && tooltipContent) {
      const cleanup = autoUpdate(
        refs.reference.current,
        refs.floating.current,
        update
      );
      requestAnimationFrame(() => {
        setShowTooltip(true);
      });
      return () => cleanup();
    }
  }, [visible, refs.reference, refs.floating, update, tooltipContent]);

  return (
    <>
      <div
        className="inline-block relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={refs.setReference}>
          {children}
        </div>

        {visible && (
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
              transition-all duration-200 ease-out
              ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
          >
            {tooltipContent}

            {video !== "" && (
              <button
                onClick={() => setShowTutorial(true)}
                className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Watch Video <span aria-hidden>↗</span>
              </button>
            )}
          </div>
        )}
      </div>

      {showTutorial && (
        <Tutorial video={video} setShowTutorial={setShowTutorial} />
      )}
    </>
  );
};

export default InfoModel;
