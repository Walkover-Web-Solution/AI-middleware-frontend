"use client"; // Correct import statement

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Chat from "@/components/configuration.js/chat";
import ConfigurationPage from "@/components/configuration.js/ConfigurationPage";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { services } from "@/jsonFiles/models";
import { createApiAction, getSingleBridgesAction, integrationAction } from "@/store/action/bridgeAction";

export const runtime = 'edge';
const Page = ({ params }) => {
  const dispatch = useDispatch();
  const { bridge, embedToken } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    embedToken: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.embed_token,
  }));

  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
  }, []);

  const [dataToSend, setDataToSend] = useState(null);

  useEffect(() => {
    if (bridge) {
      setDataToSend(prepareDataToSend(bridge));
    }
  }, [bridge]);

  useEffect(() => {
    if (embedToken) {
      appendEmbedScript(embedToken);
    }
  }, [embedToken]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    handleResizer();
  }, []);

  function handleMessage(e) {
    if (e?.data?.webhookurl) {
      if ((e?.data?.action === "published" || e?.data?.action === "created") && e?.data?.description?.length > 0) {
        const dataToSend = {
          ...e.data,
          status: e?.data?.action
        }
        dispatch(integrationAction(dataToSend, params?.id));
        const dataFromEmbed = {
          url: e?.data?.webhookurl,
          payload: e?.data?.payload,
          desc: e?.data?.description,
          id: e?.data?.id,
          status: e?.data?.action,
        };
        dispatch(createApiAction(params.id, dataFromEmbed));
      }
    }
  }

  return (
    <>
      {!bridge && <LoadingSpinner />}
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-start justify-start">
          <div className="flex w-full justify-start gap-16 items-start">
            <div className="w-full flex  ">
              <div className="w-2/3 overflow-auto p-4 h-[93vh] border-r border-gray-300 bg-gray-100 min-w-[350px] configurationPage">
                <ConfigurationPage params={params} dataToSend={dataToSend} />
                <div className='h-[70px]' />
              </div>
              <div className="resizer w-1 bg-base-500 cursor-col-resize hover:bg-primary"></div>
              <div className="w-1/3 flex-1 chatPage min-w-[450px]">
                <div className="p-4">
                  <Chat dataToSend={dataToSend} params={params} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Extracted functions for better readability
function prepareDataToSend(bridge) {
  let foundKey = Object.keys(services[bridge?.service?.toLowerCase()]).find(
    (key) => services[bridge?.service?.toLowerCase()][key].has(bridge?.configuration?.model?.default)
  );
  return {
    configuration: {
      model: bridge?.configuration?.model?.default,
      type: foundKey,
      ...(foundKey === "chat" ? { prompt: [bridge?.inputConfig?.system?.default || {}] } : {}),
      ...(foundKey === "embedding" ? { input: bridge?.input?.input } : {}),
      ...(foundKey !== "chat" && foundKey !== "embedding" ? { prompt: bridge?.input?.prompt?.prompt } : {}),
    },
    service: bridge?.service?.toLowerCase(),
    apikey: bridge?.apikey,
    bridgeType: bridge?.bridgeType,
    slugName: bridge?.slugName,
  };
}

function appendEmbedScript(embedToken) {
  const script = document.createElement("script");
  script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
  script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
  script.setAttribute("embedToken", embedToken);
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(document.getElementById("viasocket-embed-main-script"));
  };
}



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


function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
      <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
        <div className="flex items-center justify-center space-x-2">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default Protected(Page);