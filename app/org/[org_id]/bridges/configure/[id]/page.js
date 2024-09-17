"use client";

import ConfigurationPage from "@/components/configuration/ConfigurationPage";
import Chat from "@/components/configuration/chat";
import Chatbot from "@/components/configuration/chatbot";
import LoadingSpinner from "@/components/loadingSpinner";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { createApiAction, getSingleBridgesAction, integrationAction } from "@/store/action/bridgeAction";
import { getModelAction } from "@/store/action/modelAction";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const runtime = 'edge';
const Page = ({ params }) => {
  const dispatch = useDispatch();
  const { bridgeType, service, embedToken, isServiceModelsAvailable } = useCustomSelector((state) => ({
    bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service,
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    isServiceModelsAvailable: state?.modelReducer?.serviceModels?.[state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service],
  }));

  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
  }, []);

  useEffect(() => {
    if (service && !isServiceModelsAvailable) {
      dispatch(getModelAction({ service }))
    }
  }, [service]);

  useEffect(() => {
    if (embedToken) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", embedToken);
      script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
      script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID));
      };
    }
  }, [embedToken]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [params.id]);

  useEffect(() => {
    handleResizer();
  }, []);

  function handleMessage(e) {
    // todo: need to make api call to update the name & description
    if (e?.data?.webhookurl) {
      const dataToSend = {
        ...e.data,
        status: e?.data?.action
      }
      dispatch(integrationAction(dataToSend, params?.org_id));
      if ((e?.data?.action === "published" || e?.data?.action === "paused" || e?.data?.action === "created") && e?.data?.description?.length > 0) {
        const dataFromEmbed = {
          url: e?.data?.webhookurl,
          payload: e?.data?.payload,
          desc: e?.data?.description,
          id: e?.data?.id,
          status: e?.data?.action,
          title: e?.data?.title,
        };
        dispatch(createApiAction(params.org_id, dataFromEmbed));
      }
    }
  }

  return (
    <>
      {!bridgeType && <LoadingSpinner />}
      <div className="flex flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="flex flex-col md:flex-row w-full">
            <div className="w-full md:w-2/3 overflow-auto p-4 lg:h-[93vh] border-r min-w-[350px] configurationPage">
              <ConfigurationPage params={params} />
              <div className='h-[70px]' />
            </div>
            <div className="resizer w-full md:w-1 bg-base-500 cursor-col-resize hover:bg-primary"></div>
            <div className="w-full md:w-1/3 flex-1 chatPage min-w-[450px]">
              <div className="p-4 m-10 md:m-0 h-auto lg:h-full" id="parentChatbot" style={{ minHeight: "85vh" }}>
                {bridgeType === 'chatbot' ? <Chatbot params={params} /> : <Chat params={params} />}
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