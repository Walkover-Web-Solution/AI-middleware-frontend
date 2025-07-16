"use client";

import ConfigurationPage from "@/components/configuration/ConfigurationPage";
import Chat from "@/components/configuration/chat";
import Chatbot from "@/components/configuration/chatbot";
import LoadingSpinner from "@/components/loadingSpinner";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getSingleBridgesAction } from "@/store/action/bridgeAction";
import { useEffect, useRef } from "react";
import WebhookForm from "@/components/BatchApi";
import { useDispatch } from "react-redux";
import { updateTitle } from "@/utils/utility";
import AgentSetupGuide from "@/components/AgentSetupGuide";

export const runtime = 'edge';
const Page = ({ searchParams }) => {
  const apiKeySectionRef= useRef(null)
  const params = searchParams;
  const mountRef = useRef(false);
  const dispatch = useDispatch();
  const { bridgeType,versionService, bridgeName } = useCustomSelector((state) => {
    const bridgeData = state?.bridgeReducer?.allBridgesMap?.[params?.id];
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
    return {
      bridgeType: bridgeData?.bridgeType,
      versionService: versionData?.service,
      bridgeName: bridgeData?.name,
    };
  });

  useEffect(() => {
    if (bridgeName) {
      updateTitle(`GTWY Ai | ${bridgeName}`);
    }
  }, [bridgeName]);

  useEffect(() => {
    dispatch(getSingleBridgesAction({ id: params.id, version: params.version }));
    return () => {
      try {
        if (handleclose) {
          handleclose();
        }
      } catch (error) {
        console.error("Error in handleclose:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (bridgeType !== "trigger") {
      if (window?.handleclose) {
        window.handleclose();
      }
    }
  }, [bridgeType]);

  useEffect(() => {
    if (mountRef.current) {
      if (bridgeType === 'chatbot') {
        if (typeof openChatbot !== 'undefined' && document.getElementById('parentChatbot')) {
          openChatbot()
        }
      } else {
        if (typeof closeChatbot !== 'undefined') {
          closeChatbot()
        }
      }
    }
    mountRef.current = true;
  }, [bridgeType])

  useEffect(() => {
    // Call handleResizer and capture its cleanup function
    const cleanup = handleResizer();
    // Return the cleanup function to be executed on component unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return (
    <>
      {!bridgeType && <LoadingSpinner />}
      <div className="flex flex-col md:flex-row w-full">
        <div className="w-full md:w-1/2 overflow-y-auto overflow-x-hidden p-4 lg:h-[93vh] border-r min-w-[350px] configurationPage">
          <ConfigurationPage apiKeySectionRef={apiKeySectionRef} params={params} />
          <div />
        </div>
        <div className="resizer w-full md:w-1 bg-base-500 cursor-col-resize hover:bg-primary"></div>
        <div className="w-full md:w-1/2 flex-1 chatPage min-w-[450px] relative">
          <div className="m-10 md:m-0 h-auto lg:h-full" id="parentChatbot" style={{ minHeight: "85vh" }}>
            <AgentSetupGuide apiKeySectionRef={apiKeySectionRef} params={params} />
            {bridgeType === 'batch' && versionService === 'openai' ? <WebhookForm params={params} /> :bridgeType==='chatbot'? <Chatbot params={params} key={params} />: <Chat params={params} />}

          </div>
        </div>
      </div>
    </>
  );
};

// Extracted functions for better readability
function handleResizer() {
  const resizer = document.querySelector(".resizer");
  if (!resizer) return;

  const leftSide = resizer.previousElementSibling;
  const rightSide = resizer.nextElementSibling;
  let x = 0;
  let w = 0;
  // A variable to hold the iframe element
  let iframe = null;

  const mouseDownHandler = function (e) {
    // Get the iframe from the right-side panel
    iframe = rightSide.querySelector('iframe');
    
    // **KEY FIX**: Disable mouse events on the iframe
    if (iframe) {
      iframe.style.pointerEvents = 'none';
    }

    // Add bg-primary class and ensure cursor-col-resize during resizing
    resizer.classList.add('bg-primary');
    document.body.style.cursor = 'col-resize';

    x = e.clientX;
    w = leftSide.getBoundingClientRect().width;
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    const dx = e.clientX - x;
    const minLeftWidth = 350; // Minimum width for the left panel
    const minRightWidth = 450; // Minimum width for the right panel

    let newLeftWidth = w + dx;
    newLeftWidth = Math.max(minLeftWidth, newLeftWidth);
    newLeftWidth = Math.min(newLeftWidth, window.innerWidth - minRightWidth);

    leftSide.style.width = `${newLeftWidth}px`;
  };

  const mouseUpHandler = function () {
    // **KEY FIX**: Re-enable mouse events on the iframe
    if (iframe) {
      iframe.style.pointerEvents = 'auto';
    }
    
    // Remove bg-primary class and reset cursor when done resizing
    resizer.classList.remove('bg-primary');
    document.body.style.cursor = '';

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  resizer.addEventListener("mousedown", mouseDownHandler);

  // Return the cleanup function to be called when the component unmounts
  return () => {
    // Ensure styles and events are cleaned up on unmount
    if (iframe) {
       iframe.style.pointerEvents = 'auto';
    }
    resizer.removeEventListener("mousedown", mouseDownHandler);
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };
}

export default Protected(Page);