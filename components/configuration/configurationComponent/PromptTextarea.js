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

  // Sync external value
  useEffect(() => {
    const editor = textareaRef.current;
    if (!editor || isComposingRef.current) return;

    if (!hasInitializedRef.current) {
      editor.value = initialValue || "";
      lastExternalValueRef.current = initialValue;
      hasInitializedRef.current = true;
      return;
    }

    if (initialValue !== lastExternalValueRef.current) {
      editor.value = initialValue || "";
      lastExternalValueRef.current = initialValue;
    }
  }, [initialValue, textareaRef]);

  // 🔹 Force textarea to recalculate height when prompt helper opens/closes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Force reflow by toggling height
    textarea.style.height = '0px';
    // Trigger reflow
    textarea.offsetHeight;
    // Reset to full height
    textarea.style.height = '100%';
  }, [isPromptHelperOpen, textareaRef]);

  // Change handler
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    if (!isComposingRef.current) {
      onChange(value);
    }
  }, [onChange]);

  // IME support
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback((e) => {
    isComposingRef.current = false;
    onChange(e.target.value);
  }, [onChange]);

  const handleFocus = useCallback((e) => {
    onFocus?.(e);
  }, [onFocus]);

  const handleKeyDown = useCallback((e) => {
    onKeyDown?.(e);
  }, [onKeyDown]);

  return (
   <div
  className={`
    textarea bg-white dark:bg-black/15 border
    w-full resize-y overflow-hidden relative z-low rounded-b-none
    transition-none !duration-0 flex p-0 m-0
    ring-2 ring-transparent
    focus-within:ring-2 focus-within:ring-base-content/20
    ${isPromptHelperOpen
      ? "h-[calc(100vh-80px)] w-[700px] border-primary shadow-md"
      : "h-96 border-base-content/20"
    }
  `}
>

        
      <textarea
        ref={textareaRef}
        disabled={isPublished}
        className={`
          w-full h-full p-2 resize-none bg-transparent border-none 
          caret-base-content outline-none overflow-auto
          ${className}
        `}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        title={isPublished ? "Cannot edit in published mode" : ""}
      />
    </div>
  );
});

PromptTextarea.displayName = 'PromptTextarea';
export default PromptTextarea;