"use client";
import Navbar from "@/components/navbar";
import MainSlider from "@/components/sliders/mainSlider";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useEmbedScriptLoader } from "@/customHooks/embedScriptLoader";
import { getAllApikeyAction } from "@/store/action/apiKeyAction";
import { createApiAction, getAllBridgesAction, getAllFunctions, integrationAction } from "@/store/action/bridgeAction";
import { getAllChatBotAction } from "@/store/action/chatBotAction";
import { getAllKnowBaseDataAction } from "@/store/action/knowledgeBaseAction";
import { MODAL_TYPE } from "@/utils/enums";
import { openModal } from "@/utils/utility";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

export default function layoutOrgPage({ children, params }) {
  const dispatch = useDispatch();
  const pathName = usePathname();
  const path = pathName.split('?')[0].split('/')

  const { chatbot_token, embedToken } = useCustomSelector((state) => ({
    chatbot_token: state?.ChatBot?.chatbot_token || '',
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
  }));
  useEmbedScriptLoader(embedToken);

  useEffect(() => {
    dispatch(getAllBridgesAction((data) => {
        if (data === 0) {
        openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
        }
    }))
    dispatch(getAllFunctions())
  }, []);

  useEffect(() => {
    if (params?.org_id) {
      dispatch(getAllApikeyAction(params?.org_id));
      dispatch(getAllKnowBaseDataAction(params?.org_id))
    }
  }, [dispatch, params?.org_id]);

  const scriptId = "chatbot-main-script";
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {
    const updateScript = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      if (chatbot_token) {
        const script = document.createElement("script");
        script.setAttribute("embedToken", chatbot_token);
        script.setAttribute("hideIcon", true);
        script.id = scriptId;
        script.src = scriptSrc;
        document.head.appendChild(script);
      }
    };

    setTimeout(() => {
      updateScript();
    }, 150); // Delay of 150ms

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [chatbot_token]);

  useEffect(() => {
    dispatch(getAllChatBotAction(params.org_id))
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [params.id]);

  function handleMessage(e) {
    // todo: need to make api call to update the name & description
    if (e?.data?.webhookurl) {
      const dataToSend = {
        ...e.data,
        status: e?.data?.action
      }
      dispatch(integrationAction(dataToSend, params?.org_id));
      if ((e?.data?.action === "published" || e?.data?.action === "paused" || e?.data?.action === "created" || e?.data?.action === "updated")) {
        const dataFromEmbed = {
          url: e?.data?.webhookurl,
          payload: e?.data?.payload,
          desc: e?.data?.description || e?.data?.title,
          id: e?.data?.id,
          status: e?.data?.action,
          title: e?.data?.title,
        };
        dispatch(createApiAction(params.org_id, dataFromEmbed));
      }
    }
  }

  const isHomePage = useMemo(() => path?.length < 5, [path]);

  if (isHomePage) {
    return (
      <div className="flex h-screen">
        <div className=" flex flex-col  h-full">
          <MainSlider />
        </div>
        <div className="flex-1 ml-8 lg:ml-0 overflow-y-auto overflow-x-hidden">
          <Navbar />
          <main className="px-2">{children}</main>
        </div>
      </div>
    );
  } else {
    return (
      <div className="h-screen">
        <Navbar />
        {children}
      </div>
    );
  }
}