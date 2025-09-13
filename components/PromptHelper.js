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
  onClose,
  savePrompt,
  setPrompt,
  messages,
  setMessages,
  thread_id,
  autoCloseOnBlur,
  prompt,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  setNewContent,
  isEmbedUser
}) => {
  const dispatch = useDispatch();
  const [focusedSection, setFocusedSection] = useState(null); // 'notes', 'promptBuilder', or null for 50/50
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const pathname = usePathname();
  const pathParts = pathname.split('?')[0].split('/');
  const bridgeId = pathParts[5];
  
  const promptParams = params || {
    id: bridgeId || pathParts[3],
    version: pathParts[7] || pathParts[5],
  };
  // Handle optimize prompt function for Canvas component
  const handleOptimizePrompt = useCallback(async (instructionText) => {
    try {
      const response = await optimizePromptApi({
        query: instructionText,
        thread_id,
        bridge_id: promptParams.id,
        version_id: promptParams.version,
      });

      const result = typeof response === 'string' ? JSON.parse(response) : response?.data ?? response;
      
      // Store the optimized prompt
      if (result?.updated) {
        setOptimizedPrompt(result.updated);
        dispatch(optimizePromptReducer({ bridgeId: promptParams.id, prompt: result.updated }));
      }
      
      return result;
    } catch (error) {
      console.error("Error optimizing prompt:", error);
      return { description: "Failed to optimize prompt. Please try again." };
    }
  }, [promptParams, thread_id]);

  // Apply optimized prompt
  const handleApplyOptimizedPrompt = () => {
    if (optimizedPrompt && setPrompt) {
      setPrompt(optimizedPrompt);
      setHasUnsavedChanges(true);
      setNewContent(optimizedPrompt);
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
      if(isVisible){
        handleScriptLoad();
      }
    }, 100);
  }, [isVisible]);

  
  // Calculate heights based on focus
  const getNotesHeight = () => {
    if (focusedSection === 'notes') return 'h-3/4'; // 75% when focused
    if (focusedSection === 'promptBuilder') return 'h-1/4'; // 25% when prompt builder is focused
    return 'h-1/2'; // 50% when nothing is focused (default state)
  };
  
  const getPromptBuilderHeight = () => {
    if (focusedSection === 'promptBuilder') return 'h-3/4'; // 75% when focused
    if (focusedSection === 'notes') return 'h-1/4'; // 25% when notes is focused
    return 'h-1/2'; // 50% when nothing is focused (default state)
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
      className="fixed right-0 top-0 w-[49%] bottom-2 bg-base-100 border-l border-base-content/30 h-full rounded-l-md shadow-lg transition-all duration-300 ease-in-out z-30"
      onBlur={handleModalBlur}
      tabIndex={-1}
    >
      {/* Content Area - Split into two sections */}
      <div className="flex flex-col h-full">
      
        {/* Notes Section */}
        {isEmbedUser ? null : (
        <div className={`${getNotesHeight()} transition-all duration-300 ease-in-out border-b mt-4`}
         onFocus={() => setFocusedSection('notes')}
         onBlur={() => setFocusedSection(null)}
         tabIndex={0}
       >
          <div className="p-3 border-b bg-base-100">
            <div className="flex items-center gap-2">
              <BookIcon size={14} />
              <span className="text-sm font-sm">Notes</span>
            </div>
          </div>
          <div className="p-3 h-[calc(100%-30px)]" 
              
               >
            <div id='notes-embed' className='w-full h-full' >
              {/* This will be populated by the docstar script */}
            </div>   
          </div>
        </div>
        )}
       
        {/* Prompt Builder Section */}
        <div className={`${isEmbedUser ? 'h-full' : getPromptBuilderHeight()} transition-all duration-300 ease-in-out`}
        onFocus={() => setFocusedSection('promptBuilder')}
        onBlur={() => setFocusedSection(null)}
        tabIndex={0}
        >
         
          <div 
            className="p-3 h-full  flex flex-col"
            
          >
            {/* Prompt Builder layout - side by side */}
            <div className="flex flex-row h-full gap-2">
              {/* Canvas for chat interactions */}
              <div className="flex-1 flex flex-col max-h-full">
                <Canvas 
                  OptimizePrompt={handleOptimizePrompt}
                  messages={messages} 
                  setMessages={setMessages}
                  width="100%"
                  height="100%"
                  handleApplyOptimizedPrompt={handleApplyOptimizedPrompt}
                />
              </div>
              
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptHelper;