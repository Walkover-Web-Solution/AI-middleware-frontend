import React, { memo, useCallback } from 'react';

// Optimized header component with memoization
const PromptHeader = memo(({ 
    hasUnsavedChanges, 
    onSave, 
    isPromptHelperOpen, 
    isMobileView,
    onOpenDiff,
    onOpenPromptHelper,
    onClosePromptHelper,
    handleCloseTextAreaFocus,
    showCloseHelperButton = false,
    disabled = false,
    isPublished = false,
    isEditor = true,
    prompt = ''
}) => {
    const handleOpenDiff = useCallback(() => {
        onOpenDiff?.();
    }, [onOpenDiff]);

    // Conditional styling based on isPromptHelperOpen
    if (isPromptHelperOpen && !isMobileView) {
        return (
            <div className={`flex z-very-high items-center justify-between p-3 border-b border-base-300 bg-base-50 ${!isEditor ? 'mt-8' : ''}`}>
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-base-content">System Prompt</h3>
                </div>
                
                <div className="flex items-center gap-4">
                    {prompt && (
                        <span
                            className="text-sm text-base-content hover:text-base-content/80 hover:bg-base-200 cursor-pointer px-2 py-1 rounded transition-colors"
                            onClick={handleOpenDiff}
                            title="View Diff"
                        >
                            Diff
                        </span>
                    )}
                    <span
                        className="text-sm text-error hover:text-error/80 hover:bg-error/10 cursor-pointer px-2 py-1 rounded transition-colors"
                        onClick={handleCloseTextAreaFocus}
                        title="Close Prompt Helper"
                    >
                        Close Helper
                    </span>
                </div>
            </div>
        );
    }

    // Default styling when isPromptHelperOpen is false
    return (
        <div className="flex justify-between items-center">
            <div className="label flex items-center gap-2">
                <span className="label-text capitalize font-medium">System Prompt</span>
            </div>

            <div className="label cursor-pointer gap-6 sm:gap-4">
                  {prompt && (
                      <span
                            className="text-sm text-base-content hover:text-base-content/80 hover:bg-base-200 cursor-pointer px-2 py-1 rounded transition-colors"
                            onClick={handleOpenDiff}
                            title="View Diff"
                        >
                            Diff
                        </span>
                  )}
                    {!isPromptHelperOpen ? (
                    <span
                        className="text-sm text-base-content hover:text-base-content/80 hover:bg-base-200 cursor-pointer px-2 py-1 rounded transition-colors"
                        onClick={onOpenPromptHelper}
                        title={isPublished ? "Prompt Helper: Cannot edit in published mode" : "Open Prompt Helper"}
                    >
                        Prompt Helper
                    </span>
                ) : showCloseHelperButton && (
                    <span
                        className="text-sm text-error hover:text-error/80 hover:bg-error/10 cursor-pointer px-2 py-1 rounded transition-colors"
                        onClick={handleCloseTextAreaFocus}
                        title="Close Prompt Helper"
                    >
                        Close Helper
                    </span>
                )}
              
                {isPromptHelperOpen && !isMobileView && prompt && (
                    <span
                        className="text-sm text-base-content hover:text-base-content/80 hover:bg-base-200 cursor-pointer px-2 py-1 rounded transition-colors"
                        onClick={handleOpenDiff}
                    >
                        Diff
                    </span>
                )}
            </div>
        </div>
    );
});

PromptHeader.displayName = 'PromptHeader';

export default PromptHeader;
