"use client";

import ConfigurationPage from "@/components/configuration/ConfigurationPage";
import Chat from "@/components/configuration/chat";
import Chatbot from "@/components/configuration/chatbot";
import LoadingSpinner from "@/components/loadingSpinner";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getSingleBridgesAction } from "@/store/action/bridgeAction";
import { useEffect, useRef, useState } from "react";
import WebhookForm from "@/components/BatchApi";
import { useDispatch } from "react-redux";
import { updateTitle } from "@/utils/utility";
import AgentSetupGuide from "@/components/AgentSetupGuide";

export const runtime = 'edge';

const Page = ({ searchParams }) => {
  const apiKeySectionRef = useRef(null);
  const promptTextAreaRef = useRef(null);
  const params = searchParams;
  const mountRef = useRef(false);
  const dispatch = useDispatch();
  const [isDesktop, setIsDesktop] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // Width of the left panel in percentage
  const [isResizing, setIsResizing] = useState(false);

  // Ref for the main container to calculate percentage-based width
  const containerRef = useRef(null); 

  const { bridgeType, versionService, bridgeName } = useCustomSelector((state) => {
    const bridgeData = state?.bridgeReducer?.allBridgesMap?.[params?.id];
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
    return {
      bridgeType: bridgeData?.bridgeType,
      versionService: versionData?.service,
      bridgeName: bridgeData?.name,
    };
  });

  // Enhanced responsive detection
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setLeftWidth(50); // Reset on mobile
      }
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
    dispatch(getSingleBridgesAction({ id: params.id, version: params.version }));
    return () => {
      try {
        if (typeof window !== 'undefined' && window?.handleclose && document.getElementById('iframe-viasocket-embed-parent-container')) {
          window.handleclose();
        }
      } catch (error) {
        console.error("Error in handleclose:", error);
      }
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

  if (!bridgeType) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }


  return (
    <div 
      ref={containerRef} // Add ref to the main container
      className={`w-full h-full max-h-[calc(100vh-4rem)] ${isDesktop ? 'flex flex-row overflow-hidden' : 'overflow-y-auto'}`}
    >
      {/* Configuration Panel */}
      <div 
        className={`
          ${isDesktop ? 'h-full flex flex-col' : 'min-h-screen border-b border-gray-200'} 
          bg-white
        `}
        style={isDesktop ? { width: `${leftWidth}%` } : {}}
      >
        <div className={`${isDesktop ? 'flex-1 overflow-y-auto overflow-x-hidden' : ''} px-4 py-4`}>
          <ConfigurationPage apiKeySectionRef={apiKeySectionRef} promptTextAreaRef={promptTextAreaRef}  params={params} />
        </div>
      </div>

      {/* Desktop Resizer */}
      {isDesktop && (
        <div 
          className={`w-1 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 flex-shrink-0 resizer ${isResizing ? 'bg-blue-500' : 'bg-gray-200'}`}
        />
      )}

      {/* Chat Panel (Right Side) */}
      <div 
        className={`
          ${isDesktop ? 'h-full flex flex-col' : 'min-h-screen'} 
          relative
        `}
        style={isDesktop ? { width: `${100 - leftWidth}%` } : {}}
        id="parentChatbot"
      >
        <div className={`${isDesktop ? 'flex-1 overflow-y-auto overflow-x-hidden' : ''} pb-4`}>
          <div className={`${isDesktop ? 'h-full flex flex-col' : ''}`}>
            <AgentSetupGuide apiKeySectionRef={apiKeySectionRef} promptTextAreaRef={promptTextAreaRef} params={params} />
            <div className={`${isDesktop ? 'flex-1 min-h-0' : ''}`}>
              {bridgeType === 'batch' && versionService === 'openai' ? (
                <WebhookForm params={params} />
              ) : bridgeType === 'chatbot' ? (
                <Chatbot params={params} key={JSON.stringify(params)} />
              ) : (
                <Chat params={params} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protected(Page);