"use client";

import ConfigurationPage from "@/components/configuration/ConfigurationPage";
import Chat from "@/components/configuration/chat";
import Chatbot from "@/components/configuration/chatbot";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getAllBridgesAction, getSingleBridgesAction } from "@/store/action/bridgeAction";
import { useEffect, useRef, useState, use, useCallback } from "react";
import WebhookForm from "@/components/BatchApi";
import { useDispatch } from "react-redux";
import { updateTitle, generateRandomID } from "@/utils/utility";
import AgentSetupGuide from "@/components/AgentSetupGuide";
import { useRouter } from "next/navigation";
import PromptHelper from "@/components/PromptHelper";
import { setIsFocusReducer, setThreadIdForVersionReducer } from "@/store/reducer/bridgeReducer";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";

export const runtime = 'edge';

const Page = ({ params, searchParams, isEmbedUser }) => {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const apiKeySectionRef = useRef(null);
  const promptTextAreaRef = useRef(null);
  const router = useRouter();
  const mountRef = useRef(false);
  const dispatch = useDispatch();
  const [isDesktop, setIsDesktop] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // Width of the left panel in percentage
  const [isResizing, setIsResizing] = useState(false);

  // Ref for the main container to calculate percentage-based width
  const containerRef = useRef(null);

  const { bridgeType, versionService, bridgeName, allbridges, isFocus, reduxPrompt, bridge,initialFall_back,fall_back } = useCustomSelector((state) => {
    const bridgeData = state?.bridgeReducer?.allBridgesMap?.[resolvedParams?.id];
    const allbridges = state?.bridgeReducer?.org?.[resolvedParams?.org_id]?.orgs || [];
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[resolvedParams?.id]?.[resolvedSearchParams?.version];
    const isFocus = state?.bridgeReducer?.isFocus;
    return {
      bridgeType: bridgeData?.bridgeType,
      versionService: versionData?.service,
      bridgeName: bridgeData?.name,
      allbridges,
      isFocus,
      reduxPrompt: versionData?.configuration?.prompt || "",
      bridge: versionData || {},
      initialFall_back: state?.bridgeReducer?.org[resolvedParams?.org_id].orgs.find((org)=>org?._id===resolvedParams?.id)?.configuration?.fall_back||{},
      fall_back: versionData?.fall_back,

    };
  });
  const handleFallback_ModelChange = useCallback((group, model,is_enable) => {
      dispatch(updateBridgeVersionAction({
        versionId: resolvedSearchParams?.version,
        dataToSend: {
           fall_back:{
              model:model,
              service:group,
              is_enable:is_enable
           }
        }
      }));
  }, []);
  useEffect(()=>{
    handleFallback_ModelChange(fall_back?.service||initialFall_back?.service,fall_back?.model||initialFall_back?.model,fall_back?.is_enable||initialFall_back?.is_enable)
  },[])
  // PromptHelper state management
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' ? window.innerWidth < 710 : false);
  const [isPromptHelperOpen, setIsPromptHelperOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const initialThreadId = bridge?.thread_id || generateRandomID();
  const [thread_id, setThreadId] = useState(initialThreadId);
  const [messages, setMessages] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newContent, setNewContent] = useState('');

  // Track PromptHelper section visibility states
  const [showNotes, setShowNotes] = useState(true);
  const [showPromptHelper, setShowPromptHelper] = useState(true);

  // Calculate width based on visible sections
  const getConfigurationWidth = () => {
    if (!isPromptHelperOpen) return leftWidth; // Normal resizable behavior when closed
    
    // When PromptHelper is open, check which sections are visible
    if (showNotes && showPromptHelper) {
      return 33.33; // 1/3 when both sections are visible
    } else {
      return 50; // 1/2 when only one section is visible
    }
  };

  useEffect(() => {
    if (isPromptHelperOpen)
        setLeftWidth(44);
    else
        setLeftWidth(50);
  }, [isPromptHelperOpen])

  const leftPanelScrollRef = useRef(null);
  const handleCloseTextAreaFocus = useCallback(() => {
    if (typeof window.closeTechDoc === 'function') {
      window.closeTechDoc();
    }
    setIsPromptHelperOpen(false);
  }, [isPromptHelperOpen]);
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
  useEffect(()=>{
    if(!isDesktop){
    setIsPromptHelperOpen(false)
    }
  },[isDesktop])
  useEffect(() => {
    if (isPromptHelperOpen) {
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
        scrollContainer.style.overflowX='hidden'
      }
    }
  }, [isPromptHelperOpen]);
  // PromptHelper effects
  useEffect(() => {
    dispatch(setIsFocusReducer(isPromptHelperOpen));
  }, [isPromptHelperOpen, dispatch]);

  // Ensure thread_id exists in Redux for this bridge/version on mount
  useEffect(() => {
    if (setThreadIdForVersionReducer && resolvedParams?.id && resolvedSearchParams?.version) {
      dispatch(setThreadIdForVersionReducer({
        bridgeId: resolvedParams.id,
        versionId: resolvedSearchParams.version,
        thread_id: initialThreadId,
      }));
    }
  }, [dispatch, resolvedParams?.id, resolvedSearchParams?.version, initialThreadId]);

  // Update prompt state when reduxPrompt changes
  useEffect(() => {
    setPrompt(reduxPrompt);
  }, [reduxPrompt]);

  // Enhanced responsive detection
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 710;
      setIsDesktop(desktop);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (bridgeName) {
      updateTitle(`GTWY Ai | ${bridgeName}`);
    }
  }, [bridgeName]);

  // Data fetching and other effects...
  useEffect(() => {
    (async () => {
      let bridges = allbridges;
      if (allbridges?.length === 0) {
        await dispatch(getAllBridgesAction((data) => {
          bridges = data
        }));
      }
      const agentName = bridges?.find((bridge) => bridge._id === resolvedParams?.id)
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
    if (!isDesktop) return;

    const resizer = document.querySelector(".resizer");
    const container = containerRef.current;
    if (!resizer || !container) return;

    let x = 0;
    let initialLeftWidth = 0;
    let overlay = null;

    const mouseDownHandler = (e) => {
      e.preventDefault(); // Prevent text selection
      setIsResizing(true);
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
      setLeftWidth(constrainedWidth);
    };

    const mouseUpHandler = () => {
      setIsResizing(false);

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
  }, [isDesktop]); // Rerun when switching between desktop/mobile


  return (
    <div
      ref={containerRef} // Add ref to the main container
      className={`w-full h-full transition-all duration-700 ease-in-out overflow-x-hidden ${!isFocus ? 'max-h-[calc(100vh-4rem)]' : ' overflow-y-hidden'} ${isDesktop ? 'flex flex-row overflow-x-hidden overflow-y-hidden' : 'overflow-y-auto'}`}
    >
      {/* Configuration Panel */}
      <div
        className={`
          ${isDesktop ? 'h-full flex flex-col' : 'min-h-screen border-b border-base-300'} 
          bg-base-100 transition-all duration-700 ease-in-out transform
        `}
        style={isDesktop ? { width: `${isFocus? `${getConfigurationWidth()}%` : `${leftWidth}%`}` } : {}}
      >
        <div ref={leftPanelScrollRef} className={`${isDesktop ? ' flex-1 overflow-y-auto overflow-x-hidden' : ''} px-4 py-4 transition-all duration-700 ease-in-out transform`}>
          <ConfigurationPage
            apiKeySectionRef={apiKeySectionRef}
            promptTextAreaRef={promptTextAreaRef}
            params={resolvedParams}
            searchParams={resolvedSearchParams}
            isEmbedUser={isEmbedUser}
            // PromptHelper props
            isPromptHelperOpen={isPromptHelperOpen}
            setIsPromptHelperOpen={setIsPromptHelperOpen}
            prompt={prompt}
            setPrompt={setPrompt}
            messages={messages}
            setMessages={setMessages}
            thread_id={thread_id}
            setThreadId={setThreadId}
            hasUnsavedChanges={hasUnsavedChanges}
            setHasUnsavedChanges={setHasUnsavedChanges}
            setNewContent={setNewContent}
            handleCloseTextAreaFocus={handleCloseTextAreaFocus}
            savePrompt={savePrompt}
            isMobileView={isMobileView}
            newContent={newContent}
          />
        </div>
      </div>

      {/* Desktop Resizer */}
      {isDesktop && (
        <div
          className={`w-1 hover:bg-blue-400 cursor-col-resize transition-colors duration-700 flex-shrink-0 resizer ${isResizing ? 'bg-blue-500' : 'bg-base-200'}`}
        />
      )}
      {/* Chat Panel (Right Side) */}
      <div
        className={`
          ${isDesktop ? 'h-full flex flex-col' : 'min-h-screen'} 
          relative transition-all duration-700 ease-in-out transform
        `}
        style={isDesktop ? { width: `${isFocus ? `${100 - getConfigurationWidth()}%` : `${100 - leftWidth}%`}` } : {}}
        id="parentChatbot"
      >
        <div className={`${isDesktop && !isFocus ? 'flex-1 overflow-y-auto overflow-x-hidden' : ' h-full'}`}>
          <div className={`${isDesktop ? 'h-full flex flex-col' : ''}`}>
            {!isPromptHelperOpen ? <AgentSetupGuide apiKeySectionRef={apiKeySectionRef} promptTextAreaRef={promptTextAreaRef} params={resolvedParams} searchParams={resolvedSearchParams} /> : null}
            {isPromptHelperOpen ? ( <PromptHelper
                  isVisible={isPromptHelperOpen && !isMobileView}
                  params={resolvedParams}
                  onClose={handleCloseTextAreaFocus}
                  savePrompt={savePrompt}
                  setPrompt={setPrompt}
                  messages={messages}
                  setMessages={setMessages}
                  thread_id={thread_id}
                  onResetThreadId={() => {
                    const newId = generateRandomID();
                    setThreadId(newId);
                    setThreadIdForVersionReducer && dispatch(setThreadIdForVersionReducer({
                      bridgeId: resolvedParams?.id,
                      versionId: resolvedSearchParams?.version,
                      thread_id: newId,
                    }));
                  }}
                  prompt={prompt}
                  hasUnsavedChanges={hasUnsavedChanges}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                  setNewContent={setNewContent}
                  isEmbedUser={isEmbedUser}
                  // Toggle states
                  showNotes={showNotes}
                  setShowNotes={setShowNotes}
                  showPromptHelper={showPromptHelper}
                  setShowPromptHelper={setShowPromptHelper}
                />) : null}
            {!sessionStorage.getItem('orchestralUser') ? <div className={`${isDesktop ? 'flex-1 min-h-0' : ''}`}>
              {bridgeType === 'batch' && versionService === 'openai' && !isPromptHelperOpen ? (
                <WebhookForm params={resolvedParams} searchParams={resolvedSearchParams} />
              )  : bridgeType === 'chatbot' && !isPromptHelperOpen ? (
               null
              ) : (
               !isPromptHelperOpen && <Chat params={resolvedParams} searchParams={resolvedSearchParams} />
              )}
            </div> : <div className={`${isDesktop ? 'flex-1 min-h-0' : ''}`}>
              <Chat params={resolvedParams} searchParams={resolvedSearchParams} />
            </div>}
          </div>
        </div>
      </div>
      <Chatbot params={resolvedParams} searchParams={resolvedSearchParams} />
    </div>
  );
};

export default Protected(Page);