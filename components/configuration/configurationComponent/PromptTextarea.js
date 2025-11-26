import React, { useRef, useCallback, useMemo, memo, useEffect, forwardRef, useImperativeHandle } from 'react';

// Ultra-smooth textarea component with zero re-renders during typing
const PromptTextarea = memo(({ 
    textareaRef,
    initialValue = "",
    onChange, 
    onFocus, 
    onKeyDown,
    isPromptHelperOpen,
    className = "",
    placeholder = "",
    isPublished = false
}) => {
    const isComposingRef = useRef(false);
    const lastExternalValueRef = useRef(initialValue);
    
    // Update editor content when external value changes (like from Redux)
    useEffect(() => {
        if (initialValue !== lastExternalValueRef.current && textareaRef.current && !isComposingRef.current) {
            textareaRef.current.innerText = initialValue || "";
            lastExternalValueRef.current = initialValue;
        }
    }, [initialValue]);
    
    // Manage textarea height based on PromptHelper state
    useEffect(() => {
        if(!isPromptHelperOpen){
            textareaRef.current.style.height = '24rem';
        }
    }, [isPromptHelperOpen]);
    // Zero-render change handler - no state updates
    const handleChange = useCallback((e) => {
        const value = e.target.innerText;
        // Only call parent onChange if not composing (for IME support)
        if (!isComposingRef.current) {
            onChange(value);
        }
    }, [onChange]);
    
    // Handle composition events for better IME support
    const handleCompositionStart = useCallback(() => {
        isComposingRef.current = true;
    }, []);
    
    const handleCompositionEnd = useCallback((e) => {
        isComposingRef.current = false;
        const value = e.target.innerText;
        onChange(value);
    }, [onChange]);

    // Optimized focus handler
    const handleFocus = useCallback((e) => {
        onFocus?.(e);
    }, [onFocus]);

    // Optimized keydown handler
    const handleKeyDown = useCallback((e) => {
        onKeyDown?.(e);
    }, [onKeyDown]);

    return (
    <div
  ref={textareaRef}
  contentEditable={!isPublished}
  className={`textarea bg-white dark:bg-black/15 border border-base-content/20 w-full resize-y overflow-auto relative z-low caret-base-content p-2 rounded-b-none transition-none !duration-0
    ${isPromptHelperOpen 
      ? "min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] w-[700px] border-primary shadow-md pb-8"
      : "h-96 min-h-96"
    }`}
  onInput={handleChange}
  onFocus={handleFocus}
  onKeyDown={handleKeyDown}
  onCompositionStart={handleCompositionStart}
  onCompositionEnd={handleCompositionEnd}
  placeholder={placeholder}
  title={isPublished ? "Cannot edit in published mode" : ""}
/>
);
});

PromptTextarea.displayName = 'PromptTextarea';

export default PromptTextarea;
