import React, { memo, useCallback } from 'react';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import InfoTooltip from '@/components/InfoTooltip';

// Optimized header component with memoization
const PromptHeader = memo(({ 
    hasUnsavedChanges, 
    onSave, 
    isPromptHelperOpen, 
    isMobileView,
    onOpenDiff,
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

    return (
        <div className="flex justify-between items-center">
            <div className="label flex items-center gap-2">
                <span className="label-text capitalize font-medium">Prompt</span>
            </div>

            <div className="label cursor-pointer gap-1 sm:gap-2">
                <button
                    className={`btn btn-sm ${hasUnsavedChanges ? 'btn-primary' : 'btn-disabled'}`}
                    onClick={handleSave}
                    disabled={disabled || !hasUnsavedChanges}
                >
                    Save
                </button>
                {isPromptHelperOpen && !isMobileView && (
                    <button
                        className="btn text-xs sm:text-sm btn-sm"
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
