"use client";
import { useEffect } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";

export default function layoutHistoryPage({ children, params }) {
    const { chatbot_token, embedToken, alertingEmbedToken } = useCustomSelector((state) => ({
        chatbot_token: state?.ChatBot?.chatbot_token || '',
        embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
        alertingEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.alerting_embed_token,
    
      }));
  const scriptId = "chatbot-main-script";
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
    
    const script = document.createElement("script");
    script.setAttribute("embedToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiIxMTIwMiIsImNoYXRib3RfaWQiOiI2NzI4NmQ0MDgzZTQ4MmZkNWI0NjZiNjkiLCJ1c2VyX2lkIjoiMTIzNCJ9.l6E8OyvSeQW5gxoZbLQ_lBx4yNsF5BQsOWQHL64hxoQ");
    script.setAttribute("hideIcon", "true");
    script.id = scriptId;
    script.src = scriptSrc;
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
      }, 150); // Delay of 150ms
    //   setTimeout(() => { window.openChabot(); }, 500);
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}