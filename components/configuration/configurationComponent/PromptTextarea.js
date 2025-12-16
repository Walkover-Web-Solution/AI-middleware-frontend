import React, { useRef, useCallback, memo, useEffect, useState } from 'react';

// Native textarea component for prompt editing
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
    // Local state to manage the textarea value
    const [value, setValue] = useState(initialValue);
    const isComposingRef = useRef(false);
    
    // Update component when initialValue changes (e.g., from Redux)
    useEffect(() => {
        if (!isComposingRef.current) {
            setValue(initialValue || "");
        }
    }, [initialValue]);
    
    // Manage textarea height based on PromptHelper state
    useEffect(() => {
        if (textareaRef.current) {
            if (isPromptHelperOpen) {
                // When prompt helper is open, set a fixed max height regardless of content
                textareaRef.current.style.height = 'calc(100vh - 80px)';
                textareaRef.current.style.maxHeight = 'calc(100vh - 80px)';
                textareaRef.current.style.overflowY = 'auto';
            } else {
                // When prompt helper is closed, revert to normal size
                textareaRef.current.style.height = '24rem';
                textareaRef.current.style.maxHeight = '24rem';
            }
        }
    }, [isPromptHelperOpen, textareaRef]);
    
    // Handle textarea change event
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        setValue(newValue);
        
        // Only call parent onChange if not composing (for IME support)
        if (!isComposingRef.current) {
            onChange(newValue);
        }
    }, [onChange]);
    
    // Handle composition events for better IME support
    const handleCompositionStart = useCallback(() => {
        isComposingRef.current = true;
    }, []);
    
    const handleCompositionEnd = useCallback((e) => {
        isComposingRef.current = false;
        const newValue = e.target.value;
        onChange(newValue);
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
      disabled={isPublished}
      className={`textarea bg-white dark:bg-black/15 border border-base-content/20 w-full resize-none relative z-low caret-base-content p-2 rounded-b-none transition-none !duration-0
        ${isPromptHelperOpen 
          ? "w-[700px] border-primary shadow-md pb-8"
          : "h-96"
        }`}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder={placeholder}
      value={value}
      title={isPublished ? "Cannot edit in published mode" : ""}
    />
);
});

PromptTextarea.displayName = 'PromptTextarea';

export default PromptTextarea;
