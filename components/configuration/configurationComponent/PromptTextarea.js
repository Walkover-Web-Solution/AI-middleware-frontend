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
    placeholder = ""
}) => {
    const isComposingRef = useRef(false);
    const lastExternalValueRef = useRef(initialValue);
    
    // Update textarea value when external value changes (like from Redux)
    useEffect(() => {
        if (initialValue !== lastExternalValueRef.current && textareaRef.current && !isComposingRef.current) {
            textareaRef.current.value = initialValue;
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
        const value = e.target.value;
        
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
        const value = e.target.value;
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
        <textarea
            ref={textareaRef}
            className={`textarea bg-white dark:bg-black/15 border border-base-content/20 w-full resize-y relative bg-transparent z-low caret-base-content p-2 rounded-b-none transition-none !duration-0 min-h-96 max-h-[calc(100vh-80px)] ${isPromptHelperOpen ? "min-h-[calc(100vh-80px)] w-[700px] border-primary shadow-md" : "h-96 max-h-[calc(100vh-80px)]"}`}
            defaultValue={initialValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
        />
    );
});

PromptTextarea.displayName = 'PromptTextarea';

export default PromptTextarea;
