"use client";
import { useEffect, use } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getFromCookies } from "@/utils/utility";

export default function layoutHistoryPage({ children, params }) {
    const resolvedParams = use(params);
    
    const {chatbot_token, history_page_chatbot_token} = useCustomSelector((state) => ({
        chatbot_token: state?.ChatBot?.chatbot_token || '',
        history_page_chatbot_token : state?.bridgeReducer?.org?.[resolvedParams?.org_id]?.history_page_chatbot_token
      }));
      
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

  useEffect(() => {
      const existingScript = document.getElementById('gtwy-user-script');
      if (existingScript) existingScript.remove();
  
      if (params?.org_id) {
        const scriptId = 'gtwy-user-script';
        const scriptURl =
          process.env.NEXT_PUBLIC_ENV !== 'PROD'
            ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/gtwy_dev.js`
            : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/gtwy.js`;
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = scriptURl;
        script.setAttribute('skipLoadGtwy', true);
        script.setAttribute('token', sessionStorage.getItem('proxy_token') || getFromCookies('proxy_token'));
        script.setAttribute('org_id', params?.org_id);
        script.setAttribute('customIframeId', 'gtwyEmbedInterface');
        script.setAttribute('gtwy_user', true);
        script.setAttribute('slide','right');
        // script.setAttribute('parentId', 'gtwy');
        // script.setAttribute('hideHeader', true);
        document.head.appendChild(script);
      }
    }, [params]);

  return (
    <>
      {children}
    </>
  );
}