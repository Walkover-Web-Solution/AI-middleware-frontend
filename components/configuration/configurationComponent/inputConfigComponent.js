import React, { memo, useCallback, useMemo, useRef } from 'react';
import { usePromptSelector } from '@/customHooks/useOptimizedSelector';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import PromptSummaryModal from '../../modals/PromptSummaryModal';
import ToneDropdown from './toneDropdown';
import ResponseStyleDropdown from './responseStyleDropdown';
import Diff_Modal from '@/components/modals/Diff_Modal';
import PromptHeader from './PromptHeader';
import PromptTextarea from './PromptTextarea';
import VariablesSuggestions from './VariablesSuggestions';
import DefaultVariablesSection from './DefaultVariablesSection';

// Ultra-smooth InputConfigComponent with ref-based approach
const InputConfigComponent = memo(({ 
    params, 
    searchParams, 
    promptTextAreaRef, 
    // Consolidated state props
    uiState,
    updateUiState,
    promptState,
    setPromptState,
    handleCloseTextAreaFocus,
    savePrompt,
    isMobileView
}) => {
    // Optimized Redux selector with memoization and shallow comparison
    const { prompt: reduxPrompt } = usePromptSelector(params, searchParams);
    
    // Refs for zero-render typing experience
    const debounceTimerRef = useRef(null);
    const oldContentRef = useRef(reduxPrompt);
    const currentValueRef = useRef(reduxPrompt);
    const hasUnsavedChangesRef = useRef(false);
    const textareaRef = useRef(null);
    // Update refs when redux prompt changes (external updates)
    if (oldContentRef.current !== reduxPrompt) {
        oldContentRef.current = reduxPrompt;
        currentValueRef.current = reduxPrompt;
        hasUnsavedChangesRef.current = false;
    }
    // Zero-render prompt change handler using refs only
    const handlePromptChange = useCallback((value) => {
        // Update refs immediately - no re-render
        currentValueRef.current = value;
        const hasChanges = value.trim() !== reduxPrompt.trim();
        hasUnsavedChangesRef.current = hasChanges;
        // Update save button state only when needed
        if (hasChanges !== promptState.hasUnsavedChanges) {
            setPromptState(prev => ({
                ...prev,
                hasUnsavedChanges: hasChanges
            }));
        }
        
        // Debounced updates for diff modal only
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            setPromptState(prev => ({
                ...prev,
                newContent: value
            }));
        }, 500); // Longer debounce since it's just for diff modal
    }, [reduxPrompt, promptState.hasUnsavedChanges, setPromptState]);
    
    // Optimized save handler using current ref value
    const handleSavePrompt = useCallback(() => {
        const currentValue = currentValueRef.current;
        savePrompt(currentValue);
        oldContentRef.current = currentValue;
        hasUnsavedChangesRef.current = false;
        
        // Update state only for UI elements that need it
        setPromptState(prev => ({
            ...prev,
            prompt: currentValue,
            newContent: '',
            hasUnsavedChanges: false
        }));
        handleCloseTextAreaFocus();
    }, [savePrompt, handleCloseTextAreaFocus, setPromptState]);

    // Memoized handlers to prevent unnecessary re-renders
    const handleOpenDiffModal = useCallback(() => {
        openModal(MODAL_TYPE?.DIFF_PROMPT);
    }, []);

    const handleTextareaFocus = useCallback(() => {
        if (!uiState.isPromptHelperOpen && window.innerWidth > 710) {
            updateUiState({ isPromptHelperOpen: true });
            if (typeof window.closeTechDoc === 'function') {
                window.closeTechDoc();
            }
        }
    }, [uiState.isPromptHelperOpen, updateUiState]);
    
    // Memoized values to prevent recalculation
    const isDisabled = useMemo(() => 
        !promptState.hasUnsavedChanges, 
        [promptState.hasUnsavedChanges]
    );

    // Early return for unsupported service types
    const handleKeyDown = useCallback((event) => {
        // Disable Tab key when PromptHelper is open
        if (event.key === 'Tab' && uiState.isPromptHelperOpen) {
            event.preventDefault();
            return;
        }
        
        // Close PromptHelper on Escape key
        if (event.key === 'Escape' && uiState.isPromptHelperOpen) {
            event.preventDefault();
            updateUiState({ isPromptHelperOpen: false });
            return;
        }
    }, [uiState.isPromptHelperOpen, updateUiState]);
    

    return (
        <div ref={promptTextAreaRef}>
            <PromptHeader
                hasUnsavedChanges={promptState.hasUnsavedChanges}
                onSave={handleSavePrompt}
                isPromptHelperOpen={uiState.isPromptHelperOpen}
                isMobileView={isMobileView}
                onOpenDiff={handleOpenDiffModal}
                disabled={isDisabled}
            />
            
            <div className="form-control h-full relative">
                <PromptTextarea
                    ref={textareaRef}
                    initialValue={reduxPrompt}
                    onChange={handlePromptChange}
                    onFocus={handleTextareaFocus}
                    isPromptHelperOpen={uiState.isPromptHelperOpen}
                    onKeyDown={handleKeyDown}
                />
                
                <DefaultVariablesSection />
            </div>

            <div className='flex flex-row gap-2 mt-8'>
                <ToneDropdown params={params} searchParams={searchParams} />
                <ResponseStyleDropdown params={params} searchParams={searchParams} />
            </div>

            <Diff_Modal oldContent={oldContentRef.current} newContent={promptState.newContent} />
            <PromptSummaryModal modalType={MODAL_TYPE.PROMPT_SUMMARY} params={params} searchParams={searchParams} />
        </div>
    );
});

InputConfigComponent.displayName = 'InputConfigComponent';

export default InputConfigComponent;
