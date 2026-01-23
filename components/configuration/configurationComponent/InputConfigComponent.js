import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { usePromptSelector } from "@/customHooks/useOptimizedSelector";
import { MODAL_TYPE } from "@/utils/enums";
import { openModal } from "@/utils/utility";
import PromptSummaryModal from "../../modals/PromptSummaryModal";
import Diff_Modal from "@/components/modals/DiffModal";
import PromptHeader from "./PromptHeader";
import DynamicPromptFields from "./DynamicPromptFields";
import { useCustomSelector } from "@/customHooks/customSelector";

// Ultra-smooth InputConfigComponent with ref-based approach
const InputConfigComponent = memo(
  ({
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
    isMobileView,
    closeHelperButtonLocation,
    isPublished,
    isEditor,
    isEmbedUser,
  }) => {
    const {} = useCustomSelector((state) => state.appInfoReducer.embedUserDetails);
    // Optimized Redux selector with memoization and shallow comparison
    const { prompt: reduxPrompt, oldContent } = usePromptSelector(params, searchParams);
    // Refs for zero-render typing experience
    const debounceTimerRef = useRef(null);
    const oldContentRef = useRef(oldContent);
    const hasUnsavedChangesRef = useRef(false);
    const textareaRef = useRef(null);

    // Focus state for textarea
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    // Update refs when redux prompt changes (external updates)
    if (oldContentRef.current !== reduxPrompt) {
      oldContentRef.current = oldContent || reduxPrompt;
      hasUnsavedChangesRef.current = false;
    }
    // Zero-render prompt change handler using refs only
    const handlePromptChange = useCallback(
      (value) => {
        // Update refs immediately - no re-render
        console.log("value", value);

        // Handle both string (old format) and object (new format)
        let hasChanges = false;
        if (typeof value === "string") {
          // Old format: compare strings
          hasChanges = value.trim() !== reduxPrompt.trim();
        } else if (typeof value === "object" && value !== null) {
          // New format: compare objects (simplified - just check if object exists)
          // More sophisticated comparison could be done with JSON.stringify
          hasChanges = true; // Always mark as changed when object is passed
        }

        hasUnsavedChangesRef.current = hasChanges;
        // Update save button state only when needed
        if (hasChanges !== promptState.hasUnsavedChanges) {
          setPromptState((prev) => ({
            ...prev,
            hasUnsavedChanges: hasChanges,
          }));
        }

        // Debounced updates for diff modal only
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          setPromptState((prev) => ({
            ...prev,
            newContent: value,
          }));
        }, 500); // Longer debounce since it's just for diff modal
      },
      [reduxPrompt, promptState.hasUnsavedChanges, setPromptState]
    );

    // Optimized save handler - accepts both string (old format) and object (new format)
    const handleSavePrompt = useCallback(
      (dataToSave) => {
        // If called without argument, get value from textarea (old behavior)
        // If called with argument, use it directly (new behavior from DynamicPromptFields)
        const currentValue = dataToSave !== undefined ? dataToSave : (textareaRef.current?.value || "").trim();
        console.log("currentValue", currentValue);
        savePrompt(currentValue);

        // Update refs for string values only
        if (typeof currentValue === "string") {
          oldContentRef.current = currentValue;
          hasUnsavedChangesRef.current = false;
        }

        // Update state only for UI elements that need it
        setPromptState((prev) => ({
          ...prev,
          prompt: typeof currentValue === "string" ? currentValue : prev.prompt,
          newContent: "",
          hasUnsavedChanges: false,
        }));
        // Don't close Prompt Helper when saving
        // handleCloseTextAreaFocus();
      },
      [savePrompt, setPromptState]
    );

    // Memoized handlers to prevent unnecessary re-renders
    const handleOpenDiffModal = useCallback(() => {
      // Get the current value from the textarea before opening the modal
      const currentValue = textareaRef.current?.value || "";
      // Update the newContent in promptState
      setPromptState((prev) => ({
        ...prev,
        newContent: currentValue,
      }));
      openModal(MODAL_TYPE?.DIFF_PROMPT);
    }, [setPromptState]);

    const handleOpenPromptHelper = useCallback(() => {
      if (!uiState.isPromptHelperOpen && window.innerWidth > 710) {
        updateUiState({ isPromptHelperOpen: true });
        if (typeof window.closeTechDoc === "function") {
          window.closeTechDoc();
        }
      }
    }, [uiState.isPromptHelperOpen, updateUiState]);

    const handleClosePromptHelper = useCallback(() => {
      updateUiState({ isPromptHelperOpen: false });
    }, [updateUiState]);

    // Memoized values to prevent recalculation
    const isDisabled = useMemo(() => !promptState.hasUnsavedChanges, [promptState.hasUnsavedChanges]);

    return (
      <div ref={promptTextAreaRef}>
        <PromptHeader
          hasUnsavedChanges={promptState.hasUnsavedChanges}
          onSave={handleSavePrompt}
          isPromptHelperOpen={uiState.isPromptHelperOpen}
          isMobileView={isMobileView}
          onOpenDiff={handleOpenDiffModal}
          onOpenPromptHelper={handleOpenPromptHelper}
          onClosePromptHelper={handleClosePromptHelper}
          disabled={isDisabled}
          handleCloseTextAreaFocus={handleCloseTextAreaFocus}
          isPublished={isPublished}
          isEditor={isEditor}
          prompt={reduxPrompt}
          setIsTextareaFocused={setIsTextareaFocused}
          isFocused={isTextareaFocused}
        />

        <div className="form-control relative">
          <DynamicPromptFields
            promptData={reduxPrompt}
            onChange={handlePromptChange}
            onSave={handleSavePrompt}
            isPublished={isPublished}
            isEditor={isEditor}
            setIsTextareaFocused={setIsTextareaFocused}
            isEmbedUser={isEmbedUser}
          />
        </div>

        <Diff_Modal oldContent={oldContentRef.current} newContent={textareaRef.current?.value || reduxPrompt} />
        <PromptSummaryModal modalType={MODAL_TYPE.PROMPT_SUMMARY} params={params} searchParams={searchParams} />
      </div>
    );
  }
);

InputConfigComponent.displayName = "InputConfigComponent";

export default InputConfigComponent;
