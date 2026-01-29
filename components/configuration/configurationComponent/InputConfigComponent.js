import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { usePromptSelector } from "@/customHooks/useOptimizedSelector";
import { MODAL_TYPE } from "@/utils/enums";
import { openModal } from "@/utils/utility";
import PromptSummaryModal from "../../modals/PromptSummaryModal";
import Diff_Modal from "@/components/modals/DiffModal";
import PromptHeader from "./PromptHeader";
import PromptTextarea from "./PromptTextarea";
import StructuredPromptInput from "./StructuredPromptInput";
import EmbedPromptFields from "./EmbedPromptFields";
import DefaultVariablesSection from "./DefaultVariablesSection";
import { useCustomSelector } from "@/customHooks/customSelector";
import { normalizePromptToStructured, extractVariablesFromPrompt } from "@/utils/promptUtils";

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
    const { showVariables } = useCustomSelector((state) => state.appInfoReducer.embedUserDetails);
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

    // **FIX: Calculate the current prompt value to use**
    // This gives us the live editing value for controlled inputs
    const currentPromptValue = useMemo(() => {
      // If there's newContent in state (user is editing), use that
      if (promptState.newContent) {
        return promptState.newContent;
      }
      // Otherwise use the redux value
      return reduxPrompt;
    }, [promptState.newContent, reduxPrompt]);

    // Zero-render prompt change handler using refs only
    const handlePromptChange = useCallback(
      (value) => {
        // Handle both string and object formats
        let hasChanges = false;

        if (isEmbedUser) {
          // For embed users: compare based on actual format
          if (typeof reduxPrompt === "string" && typeof value === "string") {
            hasChanges = value.trim() !== reduxPrompt.trim();
          } else if (typeof reduxPrompt === "object" && typeof value === "object") {
            hasChanges = JSON.stringify(value) !== JSON.stringify(reduxPrompt);
          } else {
            hasChanges = true; // Format changed
          }
        } else {
          // For main users: structured format
          if (typeof reduxPrompt === "string") {
            hasChanges = JSON.stringify(value) !== JSON.stringify(normalizePromptToStructured(reduxPrompt));
          } else if (typeof reduxPrompt === "object") {
            hasChanges = JSON.stringify(value) !== JSON.stringify(reduxPrompt);
          } else {
            hasChanges = JSON.stringify(value) !== JSON.stringify({ role: "", goal: "", instruction: "" });
          }
        }

        hasUnsavedChangesRef.current = hasChanges;

        // **FIX: Update newContent immediately for controlled inputs**
        setPromptState((prev) => ({
          ...prev,
          newContent: value,
          hasUnsavedChanges: hasChanges,
        }));

        // Clear any existing debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      },
      [reduxPrompt, setPromptState, isEmbedUser]
    );

    // Optimized save handler using current editor text (contentEditable div)
    const handleSavePrompt = useCallback(
      (val) => {
        let currentValue = val;

        // If val is an event or undefined, calculate from state/refs
        if (!val || (val && val.nativeEvent)) {
          if (!isEmbedUser) {
            // For main users, get structured prompt from state
            currentValue = promptState.newContent || normalizePromptToStructured(reduxPrompt);
          } else {
            // For embed users: check format
            if (typeof reduxPrompt === "string") {
              // Default prompt mode: get string from textarea
              currentValue = (textareaRef.current?.value || "").trim();
            } else if (typeof reduxPrompt === "object" && reduxPrompt !== null) {
              // Custom prompt mode: get object from state
              currentValue = promptState.newContent || reduxPrompt;
            } else {
              // Fallback
              currentValue = (textareaRef.current?.value || "").trim();
            }
          }
        }
        savePrompt(currentValue);
        oldContentRef.current = currentValue;
        hasUnsavedChangesRef.current = false;

        // Update state only for UI elements that need it
        setPromptState((prev) => ({
          ...prev,
          prompt: currentValue,
          newContent: "", // Clear newContent after save
          hasUnsavedChanges: false,
        }));
        // Don't close Prompt Helper when saving
        // handleCloseTextAreaFocus();
      },
      [savePrompt, setPromptState, isEmbedUser, reduxPrompt, promptState.newContent]
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

    // Handle textarea focus
    const handleTextareaFocus = useCallback(() => {
      setIsTextareaFocused(true);
    }, []);

    // Handle textarea blur with delay to allow button clicks
    const handleTextareaBlur = useCallback(() => {
      // Delay to allow button clicks to register before hiding
      setTimeout(() => {
        setIsTextareaFocused(false);
      }, 200);
    }, []);

    // Memoized values to prevent recalculation
    const isDisabled = useMemo(() => !promptState.hasUnsavedChanges, [promptState.hasUnsavedChanges]);

    // Early return for unsupported service types
    const handleKeyDown = useCallback(
      (event) => {
        // Disable Tab key when PromptHelper is open
        if (event.key === "Tab" && uiState.isPromptHelperOpen) {
          event.preventDefault();
          return;
        }

        // Close PromptHelper on Escape key
        if (event.key === "Escape" && uiState.isPromptHelperOpen) {
          event.preventDefault();
          updateUiState({ isPromptHelperOpen: false });
          return;
        }
      },
      [uiState.isPromptHelperOpen, updateUiState]
    );

    return (
      <div id="input-config-container" ref={promptTextAreaRef}>
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
          prompt={currentPromptValue}
          setIsTextareaFocused={setIsTextareaFocused}
          isFocused={isTextareaFocused}
        />

        <div className="form-control relative">
          {!isEmbedUser ? (
            // Main User: Structured Prompt Input (Role, Goal, Instruction)
            <StructuredPromptInput
              prompt={currentPromptValue}
              onChange={handlePromptChange}
              onSave={handleSavePrompt}
              isPublished={isPublished}
              isEditor={isEditor}
              onFocus={handleTextareaFocus}
              onBlur={handleTextareaBlur}
              isPromptHelperOpen={uiState.isPromptHelperOpen}
            />
          ) : (
            // Embed User: Check prompt format
            (() => {
              // **FIX: Use currentPromptValue instead of reduxPrompt**
              const promptToUse = currentPromptValue;

              // If prompt is a string, show single textarea (useDefaultPrompt = true)
              if (typeof promptToUse === "string") {
                return (
                  <PromptTextarea
                    textareaRef={textareaRef}
                    initialValue={promptToUse}
                    onChange={handlePromptChange}
                    isPromptHelperOpen={uiState.isPromptHelperOpen}
                    onKeyDown={handleKeyDown}
                    isPublished={isPublished}
                    isEditor={isEditor}
                    onSave={handleSavePrompt}
                    onFocus={handleTextareaFocus}
                    onTextAreaBlur={handleTextareaBlur}
                  />
                );
              }

              // If prompt is an object, check if it's custom prompt mode
              if (typeof promptToUse === "object" && promptToUse !== null) {
                // If it has customPrompt and useDefaultPrompt is false, show fields
                if (promptToUse.customPrompt && promptToUse.useDefaultPrompt === false) {
                  return (
                    <EmbedPromptFields
                      prompt={promptToUse}
                      onChange={handlePromptChange}
                      onSave={handleSavePrompt}
                      isPublished={isPublished}
                      isEditor={isEditor}
                      onFocus={handleTextareaFocus}
                      onBlur={handleTextareaBlur}
                    />
                  );
                }

                // If it's structured format (role/goal/instruction), show structured input
                if (
                  promptToUse.role !== undefined ||
                  promptToUse.goal !== undefined ||
                  promptToUse.instruction !== undefined
                ) {
                  return (
                    <StructuredPromptInput
                      prompt={promptToUse}
                      onChange={handlePromptChange}
                      onSave={handleSavePrompt}
                      isPublished={isPublished}
                      isEditor={isEditor}
                      onFocus={handleTextareaFocus}
                      onBlur={handleTextareaBlur}
                      isPromptHelperOpen={uiState.isPromptHelperOpen}
                    />
                  );
                }
              }

              // Fallback: show single textarea
              return (
                <PromptTextarea
                  textareaRef={textareaRef}
                  initialValue={typeof promptToUse === "string" ? promptToUse : ""}
                  onChange={handlePromptChange}
                  isPromptHelperOpen={uiState.isPromptHelperOpen}
                  onKeyDown={handleKeyDown}
                  isPublished={isPublished}
                  isEditor={isEditor}
                  onSave={handleSavePrompt}
                  onFocus={handleTextareaFocus}
                  onTextAreaBlur={handleTextareaBlur}
                />
              );
            })()
          )}
          {((isEmbedUser && showVariables) || !isEmbedUser) && (
            <DefaultVariablesSection
              isPublished={isPublished}
              prompt={currentPromptValue}
              isEditor={isEditor}
              customVariables={extractVariablesFromPrompt(currentPromptValue)}
            />
          )}
        </div>

        <Diff_Modal
          oldContent={
            typeof oldContentRef.current === "object"
              ? JSON.stringify(oldContentRef.current, null, 2)
              : oldContentRef.current
          }
          newContent={
            !isEmbedUser
              ? JSON.stringify(promptState.newContent || normalizePromptToStructured(reduxPrompt), null, 2)
              : textareaRef.current?.value || currentPromptValue
          }
        />
        <PromptSummaryModal modalType={MODAL_TYPE.PROMPT_SUMMARY} params={params} searchParams={searchParams} />
      </div>
    );
  }
);

InputConfigComponent.displayName = "InputConfigComponent";

export default InputConfigComponent;
