import React, { useState, useRef, useEffect } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';
import Tutorial from './tutorial';

const InfoTooltip = ({ video = "", children, tooltipContent="", className = "", placement = "top" }) => {
  const [open, setOpen] = useState(false); // for hover state
  const [showTutorial, setShowTutorial] = useState(false);
  const delayTimeout = useRef(null);

  const { refs, floatingStyles, update } = useFloating({
    placement,
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const handleOpenWithDelay = () => {
    clearTimeout(delayTimeout.current);
    delayTimeout.current = setTimeout(() => {
      setOpen(true);
    }, 300);
  };

  const handleClose = () => {
    clearTimeout(delayTimeout.current);
    delayTimeout.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  useEffect(() => {
    if (open && refs.reference.current && refs.floating.current) {
      const cleanup = autoUpdate(
        refs.reference.current,
        refs.floating.current,
        update
      );
      return () => cleanup();
    }
  }, [open, update, refs.reference, refs.floating]);
 if (tooltipContent.length === 0) {
    return <>
    {children}
    </>;
  }
  return (
    <>
      <div
        ref={refs.setReference}
        onMouseEnter={handleOpenWithDelay}
        onMouseLeave={handleClose}
        className="inline-block relative"
      >
        {children}

        {open && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            onMouseEnter={() => {
              clearTimeout(delayTimeout.current);
              setOpen(true);
            }}
            onMouseLeave={handleClose}
            className={className} 
                
          >
          
            <p className="whitespace-pre-line">{tooltipContent}</p>
         
          {video !== "" && (
            <button
              onClick={() => setShowTutorial(true)}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pointer-events-auto"
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

export default InfoTooltip;
