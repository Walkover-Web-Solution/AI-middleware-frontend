import React, { useState, useEffect, useCallback } from 'react';
import { BookIcon, BrainIcon, CloseIcon } from './Icons';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import { usePathname } from 'next/navigation';
import Canvas from '@/components/Canvas';
import { useDispatch } from 'react-redux';
import { optimizePromptReducer } from '@/store/reducer/bridgeReducer';
import { optimizePromptApi } from '@/config';

const PromptHelper = ({
  isVisible,
  params,
  searchParams,
  onClose,
  setPrompt,
  messages,
  setMessages,
  thread_id,
  onResetThreadId,
  autoCloseOnBlur,
  setHasUnsavedChanges,
  setNewContent,
  showNotes,
  setShowNotes,
  showPromptHelper,
  setShowPromptHelper
}) => {
  const dispatch = useDispatch();
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const handleNotesToggle = (checked) => {
    if (!checked && !showPromptHelper) {
      return;
    }
    setShowNotes(checked);
  };

  const handlePromptHelperToggle = (checked) => {
    if (!checked && !showNotes) {
      return;
    }
    setShowPromptHelper(checked);
  };

  const pathname = usePathname();
  const pathParts = pathname.split('?')[0].split('/');
  const bridgeId = pathParts[5];

  const handleOptimizePrompt = useCallback(async (instructionText) => {
    try {
      const response = await optimizePromptApi({
        query: instructionText,
        thread_id,
        bridge_id: params.id,
        version_id: searchParams.version,
      });

      const result = typeof response === 'string' ? JSON.parse(response) : response?.data ?? response;
      if (result?.updated) {
        setOptimizedPrompt(result.updated);
        dispatch(optimizePromptReducer({ bridgeId: params.id, prompt: result.updated }));
      }

      return result;
    } catch (error) {
      console.error("Error optimizing prompt:", error);
      return { description: "Failed to optimize prompt. Please try again." };
    }
  }, [params.id, searchParams.version, thread_id]);

  // Apply optimized prompt
  const handleApplyOptimizedPrompt = (promptToApply) => {
    const promptContent = promptToApply || optimizedPrompt;
    if (promptContent && setPrompt) {
      setPrompt(promptContent);
      setHasUnsavedChanges(true);
      setNewContent(promptContent);
    }
  };

  const handleScriptLoad = () => {
    if (typeof window.sendDataToDocstar === 'function') {
      window.sendDataToDocstar({
        parentId: 'notes-embed',
        page_id: bridgeId,
      });
      window.openTechDoc();
    } else {
      console.warn('sendDataToDocstar is not defined yet.');
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (isVisible && showNotes) {
        handleScriptLoad();
      }
    }, 100);
  }, [isVisible, showNotes, params.id, searchParams.version]);


  // Calculate widths based on toggle states
  const getNotesWidth = () => {
    if (!showNotes) return 'w-0 hidden'; // Hidden
    if (!showPromptHelper) return 'w-full'; // Full width when prompt helper is hidden
    return 'w-1/2'; // 50% when both are visible
  };

  const getPromptHelperWidth = () => {
    if (!showPromptHelper) return 'w-0 hidden'; // Hidden
    if (!showNotes) return 'w-full'; // Full width when notes is hidden
    return 'w-1/2'; // 50% when both are visible
  };

  const modalRef = React.createRef();

  // Handle click outside and ESC key for auto-close
  useEffect(() => {
    if (!autoCloseOnBlur) return;

    const handleClickOutside = (event) => {
      // Check if the click is outside our modal content
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Check if the clicked element has the modal-backdrop class or is a parent of it
        const isBackdrop = event.target.classList.contains('modal-backdrop') ||
          event.target.closest('.modal-backdrop');

        if (isBackdrop) {
          onClose();
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [autoCloseOnBlur, onClose]);

  // Handle modal blur
  const handleModalBlur = (e) => {
    // Only trigger if we're not focusing something inside the modal
    if (autoCloseOnBlur && modalRef.current && !modalRef.current.contains(document.activeElement)) {
      // Small delay to ensure we're not closing during normal navigation within the modal
      setTimeout(() => {
        if (!modalRef.current.contains(document.activeElement)) {
          onClose();
        }
      }, 100);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={modalRef}
      className=" z-very-high w-full bottom-2 bg-base-100 h-full rounded-l-md shadow-lg transition-all duration-300 ease-in-out z-30"
      onBlur={handleModalBlur}
      tabIndex={-1}
    >
      {/* Header with toggles */}
      <div className="flex items-center justify-between p-4 border-b border-base-content/20">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Prompt Helper</h3>
          <span className="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded">Press Esc to close</span>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={showNotes}
              onChange={(e) => handleNotesToggle(e.target.checked)}
            />
            <BookIcon size={14} />
            <span className="text-xs">Notes</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={showPromptHelper}
              onChange={(e) => handlePromptHelperToggle(e.target.checked)}
              disabled={!showNotes}
            />
            <BrainIcon size={14} />
            <span className="text-xs">Prompt Helper</span>
          </label>
          
          <button
            onClick={onClose}
            className="btn btn-ghost btn-xs"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>

      {/* Content Area - Split into two sections */}
      <div className="flex flex-row w-full h-full">

        {/* Prompt Builder Section - Now on LEFT */}
        {showPromptHelper && (
          <div className={`${getPromptHelperWidth()} h-full transition-all duration-500 ease-in-out border-r border-base-content/20 transform`}
            tabIndex={0}
          >

            <div
              className="p-3 h-full  flex flex-col"

            >
              {/* Prompt Builder layout - side by side */}
              <div className="flex flex-row h-full gap-2">
                {/* Canvas for chat interactions */}
                <div className="flex-1 mb-12  flex flex-col max-h-full">
                  <Canvas
                    OptimizePrompt={handleOptimizePrompt}
                    messages={(() => {
                      return messages || [];
                    })()}
                    setMessages={(value) => {
                      setMessages(value);
                    }}
                    width="100%"
                    height="100%"
                    handleApplyOptimizedPrompt={handleApplyOptimizedPrompt}
                    onResetThreadId={onResetThreadId}
                  />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Notes Section - Now on RIGHT */}
        {showNotes && (
          <div className={`${getNotesWidth()} h-full transition-all duration-500 ease-in-out transform`}
            tabIndex={0}
          >
            <div className="p-3 mt-2 h-[92vh]"
            >
              <div id='notes-embed' className='w-full h-full' >
                {/* This will be populated by the docstar script */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptHelper;