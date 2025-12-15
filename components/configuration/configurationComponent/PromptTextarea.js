import React, { useRef, useCallback, memo, useEffect , useLayoutEffect} from 'react';

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

  // 🔹 Sync external value (same logic as your div version)
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

  useLayoutEffect(() => {
  if (!isPromptHelperOpen) return;

  const wrapper = textareaRef.current?.parentElement;
  if (!wrapper) return;

  // Force browser to apply final height BEFORE paint
  wrapper.style.height = 'calc(100vh - 80px)';
  // force synchronous layout flush
  wrapper.offsetHeight;
}, [isPromptHelperOpen]);

useEffect(() => {
  const wrapper = textareaRef.current?.parentElement;
  if (!wrapper) return;

  wrapper.style.height = isPromptHelperOpen
    ? 'calc(100vh - 80px)'
    : '24rem';
}, [isPromptHelperOpen]);

  // 🔹 Change handler (textarea version)
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
      className={`textarea bg-white dark:bg-black/15 border border-base-content/20
        w-full resize-y overflow-auto relative z-low rounded-b-none
        transition-none !duration-0 flex
        ${isPromptHelperOpen 
          ? "min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] w-[700px] border-primary shadow-md pb-8"
          : "h-96 min-h-96"
        }
      `}
    >
    
      <textarea
        ref={textareaRef}
        disabled={isPublished}
        className={`w-full h-full resize-none bg-transparent
    caret-base-content outline-none overflow-auto
    [&::-webkit-scrollbar]:hidden
    [scrollbar-width:none]
    [-ms-overflow-style:none]
    ${className}`}
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
