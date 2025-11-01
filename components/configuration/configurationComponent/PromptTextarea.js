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

    // Memoized textarea class to prevent recalculation
    const textareaClass = useMemo(() => {
        return `textarea bg-white dark:bg-black/15 border border-base-content/20 w-full resize-y relative bg-transparent z-low caret-base-content p-2 rounded-b-none transition-none !duration-0 ${isPromptHelperOpen
            ? "h-[calc(100vh-60px)] w-[700px] border-primary shadow-md"
            : "min-h-96"
        } ${className}`;
    }, [isPromptHelperOpen, className]);

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
            className={textareaClass}
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
