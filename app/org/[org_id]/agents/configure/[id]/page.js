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
    handleResizer();
  }, []);

  return (
    <>
      {!bridgeType && <LoadingSpinner />}
      <div className="flex flex-col md:flex-row w-full h-full max-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-full md:w-1/2 overflow-y-auto overflow-x-hidden px-4 pb-4 h-full border-r min-w-[350px] configurationPage">
          <ConfigurationPage apiKeySectionRef={apiKeySectionRef} params={params} />
          <div />
        </div>
        <div className="resizer w-full md:w-1 bg-base-500 cursor-col-resize hover:bg-primary"></div>
        <div className="w-full md:w-1/2 flex-1 chatPage min-w-[450px] relative h-full overflow-hidden">
          <div className="h-full overflow-y-auto" id="parentChatbot">
            <div className="m-10 md:m-0 h-full min-h-[85vh]">
              <AgentSetupGuide apiKeySectionRef={apiKeySectionRef} params={params} />
              {bridgeType === 'batch' && versionService === 'openai' ? <WebhookForm params={params} /> :bridgeType==='chatbot'? <Chatbot params={params} key={params} />: <Chat params={params} />}
            </div>
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

  const mouseDownHandler = function (e) {
    // Prevent iframe from capturing mouse events
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);

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
    const newWidth = Math.max(350, Math.min(w + dx, window.innerWidth - 450));
    leftSide.style.width = `${newWidth}px`;
  };

  const mouseUpHandler = function () {
    // Remove the overlay
    const overlay = document.querySelector('div[style*="z-index: 9999"]');
    if (overlay) {
      overlay.remove();
    }

    // Remove bg-primary class and reset cursor when done resizing
    resizer.classList.remove('bg-primary');
    document.body.style.cursor = '';

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  resizer.addEventListener("mousedown", mouseDownHandler);

  // Clean up the event listeners when the component unmounts
  return () => {
    resizer.removeEventListener("mousedown", mouseDownHandler);
  };
}

export default Protected(Page);