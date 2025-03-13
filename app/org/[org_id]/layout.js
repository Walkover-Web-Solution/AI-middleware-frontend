"use client";
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import Navbar from "@/components/navbar";
import MainSlider from "@/components/sliders/mainSlider";
import { getSingleMessage } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useEmbedScriptLoader } from "@/customHooks/embedScriptLoader";
import { getAllApikeyAction } from "@/store/action/apiKeyAction";
import { createApiAction, getAllBridgesAction, getAllFunctions, integrationAction } from "@/store/action/bridgeAction";
import { getAllChatBotAction } from "@/store/action/chatBotAction";
import { getAllKnowBaseDataAction } from "@/store/action/knowledgeBaseAction";
import { MODAL_TYPE } from "@/utils/enums";
import { openModal } from "@/utils/utility";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

export default function layoutOrgPage({ children, params }) {
  const dispatch = useDispatch();
  const pathName = usePathname();
  const path = pathName.split('?')[0].split('/')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const { embedToken, alertingEmbedToken } = useCustomSelector((state) => ({
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    alertingEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.alerting_embed_token,

  }));
  const urlParams = useParams()
  useEmbedScriptLoader(pathName.includes('bridges') ? embedToken : pathName.includes('alerts') ? alertingEmbedToken : '');

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

    const updateScript = (token) => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      if (token) {
        const script = document.createElement("script");
        script.setAttribute("embedToken", token);
        script.setAttribute("hideIcon", true);
        script.setAttribute("eventsToSubscribe", JSON.stringify(["MESSAGE_CLICK"]));
        script.id = scriptId;
        script.src = scriptSrc;
        document.head.appendChild(script);
      }
    };

    dispatch(getAllChatBotAction(params.org_id)).then(e=>{
      const chatbotToken=e?.chatbot_token
      if(chatbotToken && !pathName.includes('/history')) updateScript(chatbotToken);
    })
    
    return () => {
      if (!pathName.includes('/history')) {
        const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      }
    };
  }, []);


  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [params.id]);

  async function handleMessage(e) {
    if(e.data?.metadata?.type==='trigger') return;
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
    if (e.data?.type === 'MESSAGE_CLICK') {
      try {
        const systemPromptResponse = await getSingleMessage({ bridge_id: urlParams?.id, message_id: e?.data?.data?.createdAt });
        setSelectedItem({ "System Prompt": systemPromptResponse, ...e?.data?.data });
        setIsSliderOpen(true)
      } catch (error) {
        console.error("Failed to fetch single message:", error);
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
        <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
      </div>
    );
  } else {
    return (
      <div className="h-screen">
        <Navbar />
        {children}
        <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
      </div>
    );
  }
}