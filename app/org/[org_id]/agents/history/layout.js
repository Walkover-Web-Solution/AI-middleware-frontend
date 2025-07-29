"use client";
import { useEffect } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useGetAllBridgesQuery } from "@/store/services/bridgeApi";

export default function layoutHistoryPage({ children, params }) {
    const {chatbot_token} = useCustomSelector((state) => ({
        chatbot_token: state?.ChatBot?.chatbot_token || '',
      }));
  const {data:{history_page_chatbot_token}}=useGetAllBridgesQuery(params.org_id)
  console.log(history_page_chatbot_token,"ldskfj")
  const scriptId = "chatbot-main-script";
  const scriptSrcProd = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC_PROD;
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
    
    const script = document.createElement("script");
    script.setAttribute("embedToken", history_page_chatbot_token);
    script.setAttribute("hideIcon", "true");
    script.id = scriptId;
    script.src = scriptSrcProd;
    document.head.appendChild(script);

    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        document.head.removeChild(script);
      }
      const updateScript = () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        if (chatbot_token) {
          const script = document.createElement("script");
          script.setAttribute("embedToken", chatbot_token);
          script.setAttribute("hideIcon", true);
          script.setAttribute("eventsToSubscribe", JSON.stringify(["MESSAGE_CLICK"]));
          script.id = scriptId;
          script.src = scriptSrc;
          document.head.appendChild(script);
        }
      };
  
      setTimeout(() => {
        updateScript();
      }, 150);
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}