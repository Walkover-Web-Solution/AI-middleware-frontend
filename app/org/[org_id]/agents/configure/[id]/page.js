"use client";

import dynamic from "next/dynamic";
import Protected from "@/components/protected";
import { useConfigurationSelector } from "@/customHooks/useOptimizedSelector";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getAllBridgesAction, getSingleBridgesAction } from "@/store/action/bridgeAction";
import { useEffect, useRef, useState, use, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { setIsFocusReducer, setThreadIdForVersionReducer } from "@/store/reducer/bridgeReducer";
import { updateTitle, generateRandomID } from "@/utils/utility";
import { useRouter } from "next/navigation";
import Chatbot from "@/components/configuration/chatbot";
import AgentSetupGuide from "@/components/AgentSetupGuide";
const ConfigurationPage = dynamic(() => import("@/components/configuration/ConfigurationPage"));
const Chat = dynamic(() => import("@/components/configuration/chat"), { loading: () => null, });
const WebhookForm = dynamic(() => import("@/components/BatchApi"), { ssr: false, });
const PromptHelper = dynamic(() => import("@/components/PromptHelper"), { ssr: false, });

export const runtime = 'edge';

const Page = ({ params, searchParams, isEmbedUser }) => {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const apiKeySectionRef = useRef(null);
  const promptTextAreaRef = useRef(null);
  const router = useRouter();
  const mountRef = useRef(false);
  const dispatch = useDispatch();
  
  // Consolidated UI state - reduced from 15+ individual states
  const [uiState, setUiState] = useState(() => ({
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 710 : false,
    leftWidth: 50,
    isResizing: false,
    isPromptHelperOpen: false,
    showNotes: true,
    showPromptHelper: true
  }));

  // Ref for the main container to calculate percentage-based width
  const containerRef = useRef(null);

  // Optimized selector with better memoization
  const { bridgeType, versionService, bridgeName, isFocus, reduxPrompt, bridge } = useConfigurationSelector(resolvedParams, resolvedSearchParams);
  
  // Separate selector for allbridges to prevent unnecessary re-renders
  const allbridges = useCustomSelector(
    useCallback((state) => state?.bridgeReducer?.org?.[resolvedParams?.org_id]?.orgs || [], [resolvedParams?.org_id])
  );
  // Consolidated prompt state - reduced from 8 individual states
  const [promptState, setPromptState] = useState(() => ({
    prompt: "",
    thread_id: bridge?.thread_id || generateRandomID(),
    messages: [],
    hasUnsavedChanges: false,
    newContent: ''
  }));

  // Memoized mobile view detection
  const isMobileView = useMemo(() => 
    typeof window !== 'undefined' ? window.innerWidth < 710 : false, 
    [uiState.isDesktop]
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      // Close PromptHelper on Escape key (global)
      if(event.key ==='tab' && uiState.isPromptHelperOpen){
        event.preventDefault();
        // setUiState(prev => ({ ...prev, isPromptHelperOpen: false }));
      }
      if (event.key === 'Escape' && uiState.isPromptHelperOpen) {
        event.preventDefault();
        setUiState(prev => ({ ...prev, isPromptHelperOpen: false }));
        // Remove focus from textarea when PromptHelper closes
        if (promptTextAreaRef.current) {
          const textarea = promptTextAreaRef.current.querySelector('textarea');
          if (textarea) {
            textarea.blur();
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [uiState.isPromptHelperOpen]);

  // Remove focus from textarea when PromptHelper closes (any method)
  useEffect(() => {
    if (!uiState.isPromptHelperOpen && promptTextAreaRef.current) {
      const textarea = promptTextAreaRef.current.querySelector('textarea');
      if (textarea && document.activeElement === textarea) {
        textarea.blur();
      }
    }
  }, [uiState.isPromptHelperOpen]);
  // Memoized width calculation to prevent unnecessary recalculations
  const configurationWidth = useMemo(() => {
    if (!uiState.isPromptHelperOpen) return uiState.leftWidth;
    
    if (uiState.showNotes && uiState.showPromptHelper) {
      return 33.33;
    } else {
      return 50;
    }
  }, [uiState.isPromptHelperOpen, uiState.leftWidth, uiState.showNotes, uiState.showPromptHelper]);

  // Optimized UI state updates
  const updateUiState = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    updateUiState({ 
      leftWidth: uiState.isPromptHelperOpen ? 44 : 50 
    });
  }, [uiState.isPromptHelperOpen, updateUiState]);

  const leftPanelScrollRef = useRef(null);
  const handleCloseTextAreaFocus = useCallback(() => {
    if (typeof window.closeTechDoc === 'function') {
      window.closeTechDoc();
    }
    updateUiState({ isPromptHelperOpen: false });
    // Remove focus from textarea when PromptHelper closes
    if (promptTextAreaRef.current) {
      const textarea = promptTextAreaRef.current.querySelector('textarea');
      if (textarea) {
        textarea.blur();
      }
    }
  }, [updateUiState]);
  const savePrompt = useCallback((newPrompt) => {
    const newValue = (newPrompt || "").trim();

    if (newValue !== reduxPrompt.trim()) {
      dispatch(updateBridgeVersionAction({
        versionId: resolvedSearchParams?.version,
        dataToSend: {
          configuration: {
            prompt: newValue
          }
        }
      }));
    }
  }, [dispatch, resolvedSearchParams?.version, reduxPrompt]);

  const scrollContainer = leftPanelScrollRef.current;
  const scrollToTextarea = () => {
    if (leftPanelScrollRef.current && promptTextAreaRef.current) {
      const textareaContainer = promptTextAreaRef.current;



      // Check if elements exist and are in the DOM
      if (!scrollContainer.contains(textareaContainer)) {
        return;
      }

      // Get the offset position of textarea container relative to scroll container
      let offsetTop = 0;
      let element = textareaContainer;

      // Calculate the total offset from the textarea container to the scroll container
      while (element && element !== scrollContainer) {
        offsetTop += element.offsetTop;
        element = element.offsetParent;
        if (element === scrollContainer) break;
      }


      // Scroll to position with some padding from top
      const targetScrollTop = offsetTop; // 50px padding from top


      scrollContainer.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  };
  useEffect(() => {
    if (!uiState.isDesktop) {
      updateUiState({ isPromptHelperOpen: false });
    }
  }, [uiState.isDesktop, updateUiState]);
  useEffect(() => {
    const scrollContainer = leftPanelScrollRef.current;
    if (uiState.isPromptHelperOpen) {
      const timeoutId = setTimeout(() => {
        scrollToTextarea();
      }, 200);
      if (scrollContainer) {
        scrollContainer.style.overflow = 'hidden';
      }
      return () => clearTimeout(timeoutId);
    } else {
      if (scrollContainer) {
        scrollContainer.style.overflowY = 'auto';
        scrollContainer.style.overflowX = 'hidden'
      }
    }
  }, [uiState.isPromptHelperOpen]);
  // PromptHelper effects
  useEffect(() => {
    dispatch(setIsFocusReducer(uiState.isPromptHelperOpen));
  }, [uiState.isPromptHelperOpen, dispatch]);

  // Ensure thread_id exists in Redux for this bridge/version on mount
  useEffect(() => {
    if (setThreadIdForVersionReducer && resolvedParams?.id && resolvedSearchParams?.version) {
      dispatch(setThreadIdForVersionReducer({
        bridgeId: resolvedParams.id,
        versionId: resolvedSearchParams.version,
        thread_id: promptState.thread_id,
      }));
    }
  }, [dispatch, resolvedParams?.id, resolvedSearchParams?.version, promptState.thread_id]);

  // Update prompt state when reduxPrompt changes
  useEffect(() => {
    setPromptState(prev => ({ ...prev, prompt: reduxPrompt }));
  }, [reduxPrompt]);

  // Enhanced responsive detection with throttling
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const desktop = window.innerWidth >= 710;
        updateUiState({ isDesktop: desktop });
      }, 100); // Throttle resize events
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateUiState]);

  useEffect(() => {
    if (bridgeName) {
      updateTitle(`GTWY Ai | ${bridgeName}`);
    }
  }, [bridgeName]);

  // Data fetching and other effects...
  useEffect(() => {
    (async () => {
      let bridges = allbridges;
      if (!Array.isArray(bridges) || bridges.length === 0) {
        await dispatch(
          getAllBridgesAction((data) => {
            // Normalize data from callback to an array
            if (Array.isArray(data)) {
              bridges = data;
            } else if (Array.isArray(data?.orgs)) {
              bridges = data.orgs;
            } else {
              bridges = [];
            }
          })
        );
      }
      const agentName = Array.isArray(bridges)
        ? bridges.find((bridge) => bridge?._id === resolvedParams?.id)
        : null;
      if (!agentName) {
        router.push(`/org/${resolvedParams?.org_id}/agents`);
        return
      }
      try {
        await dispatch(getSingleBridgesAction({ id: resolvedParams.id, version: resolvedSearchParams.version }));
      } catch (error) {
        console.error("Error in getSingleBridgesAction:", error);
      }
    })();
    return () => {
      (async () => {
        try {
          if (typeof window !== 'undefined' && window?.handleclose && document.getElementById('iframe-viasocket-embed-parent-container')) {
            await window.handleclose();
          }
        } catch (error) {
          console.error("Error in handleclose:", error);
        }
      })();
    };
  }, []);

  useEffect(() => {
    if (bridgeType !== "trigger") {
      if (typeof window !== 'undefined' && window?.handleclose && document.getElementById('iframe-viasocket-embed-parent-container')) {
        window?.handleclose();
      }
    }
  }, [bridgeType]);

  useEffect(() => {
    if (mountRef.current) {
      if (bridgeType === 'chatbot') {
        if (typeof openChatbot !== 'undefined' && document.getElementById('parentChatbot')) {
          openChatbot();
        }
      } else {
        if (typeof closeChatbot !== 'undefined') {
          closeChatbot();
        }
      }
    }
    mountRef.current = true;
  }, [bridgeType]);

  // --- REFACTORED RESIZER LOGIC ---
  useEffect(() => {
    if (!uiState.isDesktop) return;

    const resizer = document.querySelector(".resizer");
    const container = containerRef.current;
    if (!resizer || !container) return;

    let x = 0;
    let initialLeftWidth = 0;
    let overlay = null;

    const mouseDownHandler = (e) => {
      e.preventDefault(); // Prevent text selection
      updateUiState({ isResizing: true });
      x = e.clientX;

      const leftSide = resizer.previousElementSibling;
      initialLeftWidth = leftSide.getBoundingClientRect().width;

      // Create and append the overlay to fix the iframe mouse capture issue
      overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.cursor = 'col-resize';
      overlay.style.zIndex = '9999';
      document.body.appendChild(overlay);

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    const mouseMoveHandler = (e) => {
      const dx = e.clientX - x;
      const containerWidth = container.getBoundingClientRect().width;
      const newPixelWidth = initialLeftWidth + dx;

      // Calculate new width as a percentage of the container
      const newPercentageWidth = (newPixelWidth / containerWidth) * 100;

      // Constrain the width and update the React state
      const constrainedWidth = Math.max(25, Math.min(newPercentageWidth, 75));
      updateUiState({ leftWidth: constrainedWidth });
    };

    const mouseUpHandler = () => {
      updateUiState({ isResizing: false });

      // Clean up the overlay and event listeners
      if (overlay) {
        overlay.remove();
        overlay = null;
      }

      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    resizer.addEventListener("mousedown", mouseDownHandler);

    return () => {
      resizer.removeEventListener("mousedown", mouseDownHandler);
    };
  }, [uiState.isDesktop, updateUiState]); // Rerun when switching between desktop/mobile


  return (
    <div
      ref={containerRef} // Add ref to the main container
      className={`w-full h-screen transition-all duration-700 ease-in-out overflow-x-hidden ${!isFocus ? '' : ' overflow-y-hidden'} ${uiState.isDesktop ? 'flex flex-row overflow-x-hidden overflow-y-hidden' : 'overflow-y-auto'}`}
    >
      {/* Configuration Panel */}
      <div
        className={`
          ${uiState.isDesktop ? 'h-full flex flex-col' : 'h-auto border-b border-base-300'} 
          bg-base-100 transition-all duration-700 ease-in-out transform overflow-y-hidden
        `}
        style={uiState.isDesktop ? { width: `${isFocus ? `${configurationWidth}%` : `${uiState.leftWidth}%`}` } : {}}
      >
        <div ref={leftPanelScrollRef} className={`${uiState.isDesktop ? ' flex-1 overflow-y-auto overflow-x-hidden' : ''} px-4 py-4 transition-all duration-700 ease-in-out transform`}>
          <ConfigurationPage
            apiKeySectionRef={apiKeySectionRef}
            promptTextAreaRef={promptTextAreaRef}
            params={resolvedParams}
            searchParams={resolvedSearchParams}
            isEmbedUser={isEmbedUser}
            uiState={uiState}
            updateUiState={updateUiState}
            promptState={promptState}
            setPromptState={setPromptState}
            handleCloseTextAreaFocus={handleCloseTextAreaFocus}
            savePrompt={savePrompt}
            isMobileView={isMobileView}
          />
        </div>
      </div>

      {/* Desktop Resizer */}
      {uiState.isDesktop && (
        <div
          className={`w-1 hover:bg-blue-400 cursor-col-resize transition-colors duration-700 flex-shrink-0 resizer ${uiState.isResizing ? 'bg-blue-500' : 'bg-base-200'}`}
        />
      )}
      {/* Chat Panel (Right Side) */}
      <div
        className={`
          ${uiState.isDesktop ? 'h-full flex flex-col' : 'h-auto'} 
          relative transition-all duration-700 ease-in-out transform
        `}
        id="parentChatbot"
        style={uiState.isDesktop ? { width: `${isFocus ? `${100 - configurationWidth}%` : `${100 - uiState.leftWidth}%`}` } : {}}
      >
        <div className={`${uiState.isDesktop && !isFocus ? 'flex-1 overflow-y-auto overflow-x-hidden' : ' h-full'}`}>
          <div className={`${uiState.isDesktop ? 'h-full flex flex-col' : ''}`}>
            {!uiState.isPromptHelperOpen ? <AgentSetupGuide apiKeySectionRef={apiKeySectionRef} promptTextAreaRef={promptTextAreaRef} params={resolvedParams} searchParams={resolvedSearchParams} /> : null}
            {uiState.isPromptHelperOpen ? (() => {
              return (<PromptHelper
                isVisible={uiState.isPromptHelperOpen && !isMobileView}
                params={resolvedParams}
                searchParams={resolvedSearchParams}
                onClose={handleCloseTextAreaFocus}
                savePrompt={savePrompt}
                setPrompt={(value) => {
                  setPromptState(prev => ({ ...prev, newContent: value }));
                  promptTextAreaRef.current.querySelector('textarea').value = value;
                }}
                messages={promptState.messages}
              setMessages={(value) => {
                if (typeof value === 'function') {
                  setPromptState(prev => ({ ...prev, messages: value(prev.messages) }));
                } else {
                  setPromptState(prev => ({ ...prev, messages: value }));
                }
              }}
              thread_id={promptState.thread_id}
              onResetThreadId={() => {
                const newId = generateRandomID();
                setPromptState(prev => ({ ...prev, thread_id: newId }));
                setThreadIdForVersionReducer && dispatch(setThreadIdForVersionReducer({
                  bridgeId: resolvedParams?.id,
                  versionId: resolvedSearchParams?.version,
                  thread_id: newId,
                }));
              }}
              prompt={promptState.prompt}
              hasUnsavedChanges={promptState.hasUnsavedChanges}
              setHasUnsavedChanges={(value) => setPromptState(prev => ({ ...prev, hasUnsavedChanges: value }))}
              setNewContent={(value) => setPromptState(prev => ({ ...prev, newContent: value }))}
              isEmbedUser={isEmbedUser}
              showNotes={uiState.showNotes}
              setShowNotes={(value) => updateUiState({ showNotes: value })}
              showPromptHelper={uiState.showPromptHelper}
              setShowPromptHelper={(value) => updateUiState({ showPromptHelper: value })}
            />);
            })() : null}
            {!sessionStorage.getItem('orchestralUser') ? <div className={`${uiState.isDesktop ? 'flex-1 min-h-0' : ''}`}>
              {bridgeType === 'batch' && versionService === 'openai' && !uiState.isPromptHelperOpen ? (
                <WebhookForm params={resolvedParams} searchParams={resolvedSearchParams} />
              ) : <Chat params={resolvedParams} searchParams={resolvedSearchParams} />}
            </div> : <div className={`${uiState.isDesktop ? 'flex-1 min-h-0' : ''}`}>
              <Chat params={resolvedParams} searchParams={resolvedSearchParams} />
            </div>}
          </div>
        </div>
        <Chatbot params={resolvedParams} searchParams={resolvedSearchParams} />
      </div>
    </div>
  );
};

export default Protected(Page);