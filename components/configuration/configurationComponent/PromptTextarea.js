import React, { useRef, useCallback, memo, useEffect } from 'react';

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
    const hasInitializedRef = useRef(false);
    
    // Update editor content when external value changes (like from Redux)
    useEffect(() => {
        const editor = textareaRef.current;
        if (!editor || isComposingRef.current) return;

        // On first mount, always hydrate with initialValue even if it equals the ref
        if (!hasInitializedRef.current) {
            editor.innerText = initialValue || "";
            lastExternalValueRef.current = initialValue;
            hasInitializedRef.current = true;
            return;
        }

        // After first mount, only update when external value actually changes
        if (initialValue !== lastExternalValueRef.current) {
            editor.innerText = initialValue || "";
            lastExternalValueRef.current = initialValue;
        }
    }, [initialValue, textareaRef]);
    
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

    // Force plain-text pastes so theme colors stay consistent and deletion stays snappy
    const handlePaste = useCallback((e) => {
        if (isPublished) {
            e.preventDefault();
            return;
        }

        const editor = textareaRef.current;
        if (!editor || typeof window === 'undefined') {
            return;
        }

        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') ?? '';
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            editor.focus();
            return;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        editor.normalize();
        onChange(editor.innerText);
    }, [isPublished, onChange, textareaRef]);

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
  onPaste={handlePaste}
  onCompositionStart={handleCompositionStart}
  onCompositionEnd={handleCompositionEnd}
  placeholder={placeholder}
  title={isPublished ? "Cannot edit in published mode" : ""}
/>
);
});

PromptTextarea.displayName = 'PromptTextarea';

export default PromptTextarea;
