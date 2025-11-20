import React, { memo, useCallback } from 'react';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import InfoTooltip from '@/components/InfoTooltip';
import { SparklesIcon } from 'lucide-react';

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
    disabled = false
}) => {
    const handleSave = useCallback(() => {
        onSave?.();
    }, [onSave]);

    const handleOpenPromptSummary = useCallback(() => {
        openModal(MODAL_TYPE?.PROMPT_SUMMARY);
    }, []);
    
    const handleOpenDiff = useCallback(() => {
        onOpenDiff?.();
    }, [onOpenDiff]);

    // Conditional styling based on isPromptHelperOpen
    if (isPromptHelperOpen && !isMobileView) {
        return (
            <div className="flex items-center justify-between mb-4 p-3 border-b border-base-300 bg-base-50">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-base-content">Prompt</h3>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        className={`btn btn-xs ${hasUnsavedChanges ? 'btn-primary' : 'btn-disabled'}`}
                        onClick={handleSave}
                        disabled={disabled || !hasUnsavedChanges}
                        title="Save Prompt"
                    >
                        Save
                    </button>
                    <button
                        className="btn btn-xs"
                        onClick={handleOpenDiff}
                        title="View Diff"
                    >
                        Diff
                    </button>
                    <button
                        className="btn btn-xs btn-error"
                        onClick={handleCloseTextAreaFocus}
                        title="Close Prompt Helper"
                    >
                        Close Helper
                    </button>
                </div>
            </div>
        );
    }

    // Default styling when isPromptHelperOpen is false
    return (
        <div className="flex justify-between items-center">
            <div className="label flex items-center gap-2">
                <span className="label-text capitalize font-medium">Prompt</span>
            </div>

            <div className="label cursor-pointer gap-1 sm:gap-2">
                <button
                    className={`btn btn-xs ${hasUnsavedChanges ? 'btn-primary' : 'btn-disabled'}`}
                    onClick={handleSave}
                    disabled={disabled || !hasUnsavedChanges}
                >
                    Save
                </button>
              
                    {!isPromptHelperOpen ? (
                    <button
                        className="btn btn-xs btn-primary"
                        onClick={onOpenPromptHelper}
                        title="Open Prompt Helper"
                    >
                        <SparklesIcon size={12} className="" />
                        Prompt Helper
                    </button>
                ) : showCloseHelperButton && (
                    <button
                        className="btn btn-xs btn-error"
                        onClick={handleCloseTextAreaFocus}
                        title="Close Prompt Helper"
                    >
                        Close Helper
                    </button>
                )}
              
                {isPromptHelperOpen && !isMobileView && (
                    <button
                        className="btn text-xs "
                        onClick={handleOpenDiff}
                    >
                        Diff
                    </button>
                )}
            </div>
        </div>
    );
});

PromptHeader.displayName = 'PromptHeader';

export default PromptHeader;
