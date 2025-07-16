"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";

// Import your components
import ConfigurationPage from "@/components/configuration/ConfigurationPage";
import Chat from "@/components/configuration/chat";
import Chatbot from "@/components/configuration/chatbot";
import WebhookForm from "@/components/BatchApi";
import LoadingSpinner from "@/components/loadingSpinner";
import Protected from "@/components/protected";
import AgentSetupGuide from "@/components/AgentSetupGuide";

// Import your actions and utils
import { useCustomSelector } from "@/customHooks/customSelector";
import { getSingleBridgesAction } from "@/store/action/bridgeAction";
import { updateTitle } from "@/utils/utility";

export const runtime = 'edge';

const Page = ({ searchParams }) => {
  // --- Refs ---
  const apiKeySectionRef = useRef(null);
  const leftPanelRef = useRef(null); // Ref for the left panel to get its width
  const rightPanelRef = useRef(null); // Ref for the right panel to find the iframe

  // --- State ---
  const [isDesktop, setIsDesktop] = useState(true);
  const [leftWidth, setLeftWidth] = useState(50); // Left panel width in percentage
  const [isResizing, setIsResizing] = useState(false);

  // --- Redux & Hooks ---
  const params = searchParams;
  const dispatch = useDispatch();
  const { bridgeType, versionService, bridgeName } = useCustomSelector((state) => {
    const bridgeData = state?.bridgeReducer?.allBridgesMap?.[params?.id];
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
    return {
      bridgeType: bridgeData?.bridgeType,
      versionService: versionData?.service,
      bridgeName: bridgeData?.name,
    };
  });

  // --- Effects ---

  // Effect to detect screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Effect to update document title
  useEffect(() => {
    if (bridgeName) {
      updateTitle(`GTWY Ai | ${bridgeName}`);
    }
  }, [bridgeName]);

  // Effect for data fetching and initial setup
  useEffect(() => {
    dispatch(getSingleBridgesAction({ id: params.id, version: params.version }));
  }, [dispatch, params.id, params.version]);

  // --- Resizing Logic ---

  const handleMouseDown = useCallback((e) => {
    // Only allow resizing on desktop
    if (!isDesktop) return;
    e.preventDefault();
    setIsResizing(true);
  }, [isDesktop]);

  useEffect(() => {
    if (!isResizing) return;

    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    if (!leftPanel || !rightPanel) return;

    // Find iframe once resizing starts
    const iframe = rightPanel.querySelector('iframe');
    if (iframe) {
      iframe.style.pointerEvents = 'none';
    }
    document.body.style.cursor = 'col-resize';
    
    const handleMouseMove = (e) => {
      const totalWidth = window.innerWidth;
      let newLeftWidthPx = e.clientX;

      // Apply constraints
      const minLeftWidth = 350;
      const minRightWidth = 450;
      newLeftWidthPx = Math.max(minLeftWidth, newLeftWidthPx);
      newLeftWidthPx = Math.min(newLeftWidthPx, totalWidth - minRightWidth);
      
      const newLeftWidthPercent = (newLeftWidthPx / totalWidth) * 100;
      setLeftWidth(newLeftWidthPercent);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Reset styles
      if (iframe) {
        iframe.style.pointerEvents = 'auto';
      }
      document.body.style.cursor = 'auto';
    };
  }, [isResizing]);


  // Initial loading state
  if (!bridgeType) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // --- Render ---
  return (
    <div className={`w-full h-full max-h-[calc(100vh-4rem)] ${isDesktop ? 'flex flex-row overflow-hidden' : 'overflow-y-auto'}`}>
      
      {/* Left Panel */}
      <div
        ref={leftPanelRef}
        className={`bg-white ${isDesktop ? 'h-full overflow-y-auto' : 'border-b'}`}
        style={{ width: isDesktop ? `${leftWidth}%` : '100%' }}
      >
        <div className="p-4">
          <ConfigurationPage apiKeySectionRef={apiKeySectionRef} params={params} />
        </div>
      </div>

      {/* Resizer */}
      {isDesktop && (
        <div
          onMouseDown={handleMouseDown}
          className="flex-shrink-0 w-1 bg-gray-200 cursor-col-resize hover:bg-blue-400 transition-colors"
          style={{ backgroundColor: isResizing ? '#3B82F6' : '' }}
        />
      )}

      {/* Right Panel */}
      <div
        ref={rightPanelRef}
        id="parentChatbot"
        className={`relative ${isDesktop ? 'h-full overflow-y-auto' : ''}`}
        style={{ width: isDesktop ? `${100 - leftWidth}%` : '100%' }}
      >
          <AgentSetupGuide apiKeySectionRef={apiKeySectionRef} params={params} />
          {bridgeType === 'batch' && versionService === 'openai' ? (
            <WebhookForm params={params} />
          ) : bridgeType === 'chatbot' ? (
            <Chatbot params={params} key={JSON.stringify(params)} />
          ) : (
            <Chat params={params} />
          )}
      </div>
    </div>
  );
};

export default Protected(Page);