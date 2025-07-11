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
  const resizerRef = useRef(null);
  const params = searchParams;
  const mountRef = useRef(false);
  const dispatch = useDispatch();
  const [isDesktop, setIsDesktop] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

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
      
      // Reset layout for mobile
      if (!desktop) {
        setLeftWidth(50);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (bridgeName) {
      updateTitle(`GSTWY Ai | ${bridgeName}`);
    }
  }, [bridgeName]);

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
        if (typeof openChatbot !== 'undefined') {
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

  // Initialize resizer only for desktop
  useEffect(() => {
    if (isDesktop) {
      const cleanup = initializeResizer();
      return cleanup;
    }
  }, [isDesktop]);

  const initializeResizer = () => {
    if (typeof window === 'undefined') return;

    const resizer = document.querySelector(".resizer");
    if (!resizer) return;

    const leftSide = resizer.previousElementSibling;
    const rightSide = resizer.nextElementSibling;
    const container = resizer.parentElement;

    let startX = 0;
    let startLeftWidth = 0;

    const onMouseDown = (e) => {
      e.preventDefault();
      setIsResizing(true);
      
      startX = e.clientX;
      startLeftWidth = leftWidth;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      // Prevent text selection
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    };

    const onMouseMove = (e) => {
      if (!container) return;
      
      const containerWidth = container.offsetWidth;
      const deltaX = e.clientX - startX;
      const deltaPercentage = (deltaX / containerWidth) * 100;
      
      const newLeftWidth = Math.max(20, Math.min(80, startLeftWidth + deltaPercentage));
      
      setLeftWidth(newLeftWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    resizer.addEventListener('mousedown', onMouseDown);

    return () => {
      resizer.removeEventListener('mousedown', onMouseDown);
    };
  };

  if (!bridgeType) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`w-full h-full max-h-[calc(100vh-4rem)] ${isDesktop ? 'flex flex-row overflow-hidden' : 'overflow-y-auto'}`}>
      {/* Configuration Panel */}
      <div 
        className={`
          w-full
          ${isDesktop ? 'h-full flex flex-col' : 'min-h-screen'} 
          bg-white
          ${isDesktop ? 'border-r border-gray-200' : 'border-b border-gray-200'}
          ${isResizing ? 'transition-none' : 'transition-all duration-200'}
        `}
        style={isDesktop ? { width: `${leftWidth}%` } : {}}
      >
        <div className={`${isDesktop ? 'flex-1 overflow-y-auto overflow-x-hidden' : ''} px-4 py-4`}>
          <ConfigurationPage apiKeySectionRef={apiKeySectionRef} params={params} />
        </div>
      </div>

      {/* Desktop Resizer */}
      {isDesktop && (
        <div 
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 flex-shrink-0 resizer"
          style={{ backgroundColor: isResizing ? '#3B82F6' : '' }}
        />
      )}

      {/* Chat Panel */}
      <div 
        className={`
          w-full
          ${isDesktop ? 'h-full flex flex-col' : 'min-h-screen'} 
          relative
          ${isResizing ? 'transition-none' : 'transition-all duration-200'}
        `}
        style={isDesktop ? { width: `${100 - leftWidth}%` } : {}}
        id="parentChatbot"
      >
        <div className={`${isDesktop ? 'flex-1 overflow-y-auto overflow-x-hidden' : ''} pb-4`}>
          <div className={`${isDesktop ? 'h-full flex flex-col' : ''}`}>
            <AgentSetupGuide apiKeySectionRef={apiKeySectionRef} params={params} />
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