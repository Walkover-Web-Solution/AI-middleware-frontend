"use client";
import Navbar from "@/components/navbar";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useEmbedScriptLoader } from "@/customHooks/embedScriptLoader";
import { getAllApikeyAction } from "@/store/action/apiKeyAction";
import { createApiAction, getAllBridgesAction, getAllFunctions, integrationAction } from "@/store/action/bridgeAction";
import { getAllChatBotAction } from "@/store/action/chatBotAction";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function layoutOrgPage({ children, params }) {
  const dispatch = useDispatch()
  const { chatbot_token, embedToken } = useCustomSelector((state) => ({
    chatbot_token: state?.ChatBot?.chatbot_token || '',
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
  }));
  useEmbedScriptLoader(embedToken); 

  useEffect(() => {
    dispatch(getAllBridgesAction((data) => {
      if (data === 0) {
        document.getElementById('my_modal_1') && document.getElementById('my_modal_1')?.showModal()
      }
    }))
    dispatch(getAllFunctions())
  }, []);

  useEffect(() => {
    if (params?.org_id) {
      dispatch(getAllApikeyAction(params?.org_id));
    }
  }, [dispatch, params?.org_id]);

  const scriptId = "chatbot-main-script";
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {
    if (chatbot_token && !document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", chatbot_token);
      script.setAttribute("hideIcon", true);
      script.id = scriptId;
      // script.src = scriptSrc;
      document.head.appendChild(script);
      script.src = scriptSrc
    }
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

  // useEffect(() => {
  //   if (embedToken) {
  //     const script = document.createElement("script");
  //     script.setAttribute("embedToken", embedToken);
  //     script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
  //     script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
  //     document.body.appendChild(script);

  //     return () => {
  //       console.log('embedToken script')
  //       document.body.removeChild(document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID));
  //     };
  //   }
  // }, [embedToken]);

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
      if (( e?.data?.action === "published" || e?.data?.action === "paused" || e?.data?.action === "created") && e?.data?.description?.length > 0) {
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
      <Navbar />
      {children}
    </>
  );
}
