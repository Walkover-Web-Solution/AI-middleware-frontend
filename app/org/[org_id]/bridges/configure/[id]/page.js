"use client";

import WebhookForm from "@/components/BatchApi";
import ConfigurationPage from "@/components/configuration/ConfigurationPage";
import Chat from "@/components/configuration/chat";
import Chatbot from "@/components/configuration/chatbot";
import LoadingSpinner from "@/components/loadingSpinner";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getSingleBridgesAction } from "@/store/action/bridgeAction";
import { getModelAction } from "@/store/action/modelAction";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

export const runtime = 'edge';
const Page = ({ searchParams }) => {
  const params = searchParams;
  const mountRef = useRef(false);
  const dispatch = useDispatch();
  const { bridgeType, service, isServiceModelsAvailable } = useCustomSelector((state) => {
    const bridgeData = state?.bridgeReducer?.allBridgesMap?.[params?.id];
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
    return {
      bridgeType: bridgeData?.bridgeType,
      service: versionData?.service,
      isServiceModelsAvailable: state?.modelReducer?.serviceModels?.[versionData?.service],
    };
  });

  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
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
    if (service && !isServiceModelsAvailable) {
      dispatch(getModelAction({ service }))
    }
  }, [service]);

  useEffect(() => {
    handleResizer();
  }, []);

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

  return (
    <>
      {!bridgeType && <LoadingSpinner />}
      <div className="flex flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="flex flex-col md:flex-row w-full">
            <div className="w-full md:w-2/3 overflow-auto p-4 lg:h-[93vh] border-r min-w-[350px] configurationPage">
              <ConfigurationPage params={params} />
              <div/>
            </div>
            <div className="resizer w-full md:w-1 bg-base-500 cursor-col-resize hover:bg-primary"></div>
            <div className="w-full md:w-1/3 flex-1 chatPage min-w-[450px]">
              <div className="p-4 m-10 md:m-0 h-auto lg:h-full" id="parentChatbot" style={{ minHeight: "85vh" }}>
                {/* {bridgeType === 'chatbot' ? <Chatbot params={params} /> : <Chat params={params} />} */}
                <Chatbot params={params} key={params}/>
                {bridgeType === 'batch' ? <WebhookForm params={params}/> : <Chat params={params} />}
              </div>
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
  const leftSide = resizer.previousElementSibling;
  let x = 0;
  let w = 0;

  const mouseDownHandler = function (e) {
    x = e.clientX;
    w = leftSide.getBoundingClientRect().width;
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    const dx = e.clientX - x;
    leftSide.style.width = `${w + dx}px`;
  };

  const mouseUpHandler = function () {
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