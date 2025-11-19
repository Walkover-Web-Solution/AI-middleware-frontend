"use client";
import { useEffect, use, useMemo, useCallback } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getFromCookies } from "@/utils/utility";

/**
 * Optimized History Layout Component
 * - Reduced script manipulation overhead
 * - Better cleanup and error handling
 * - Memoized script configurations
 */
export default function OptimizedHistoryLayout({ children, params }) {
  const resolvedParams = use(params);
  
  // Memoized selector to prevent unnecessary re-renders
  const { chatbot_token, history_page_chatbot_token } = useCustomSelector((state) => ({
    chatbot_token: state?.ChatBot?.chatbot_token || '',
    history_page_chatbot_token: state?.bridgeReducer?.org?.[resolvedParams?.org_id]?.history_page_chatbot_token
  }), [resolvedParams?.org_id]);

  // Memoized script configurations
  const scriptConfig = useMemo(() => ({
    chatbotMainId: "chatbot-main-script",
    gtwUserScriptId: 'gtwy-user-script',
    scriptSrcProd: process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC_PROD,
    scriptSrc: process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC,
    gtwScriptUrl: process.env.NEXT_PUBLIC_ENV !== 'PROD'
      ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/gtwy_dev.js`
      : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/gtwy.js`
  }), []);

  // Optimized script management functions
  const removeScript = useCallback((scriptId) => {
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      try {
        document.head.removeChild(existingScript);
      } catch (error) {
        console.warn(`Failed to remove script ${scriptId}:`, error);
      }
    }
  }, []);

  const createScript = useCallback((config) => {
    const script = document.createElement("script");
    Object.entries(config.attributes || {}).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    if (config.id) script.id = config.id;
    if (config.src) script.src = config.src;
    return script;
  }, []);

  // Chatbot script effect
  useEffect(() => {
    if (!history_page_chatbot_token) return;

    removeScript(scriptConfig.chatbotMainId);
    
    const script = createScript({
      id: scriptConfig.chatbotMainId,
      src: scriptConfig.scriptSrcProd,
      attributes: {
        embedToken: history_page_chatbot_token,
        hideIcon: "true"
      }
    });

    document.head.appendChild(script);

    return () => {
      removeScript(scriptConfig.chatbotMainId);
      
      // Delayed script update
      const timeoutId = setTimeout(() => {
        if (chatbot_token) {
          removeScript(scriptConfig.chatbotMainId);
          
          const updateScript = createScript({
            id: scriptConfig.chatbotMainId,
            src: scriptConfig.scriptSrc,
            attributes: {
              embedToken: chatbot_token,
              hideIcon: "true",
              eventsToSubscribe: JSON.stringify(["MESSAGE_CLICK"])
            }
          });
          
          document.head.appendChild(updateScript);
        }
      }, 150);

      return () => clearTimeout(timeoutId);
    };
  }, [history_page_chatbot_token, chatbot_token, scriptConfig, removeScript, createScript]);

  // GTWY user script effect
  useEffect(() => {
    if (!resolvedParams?.org_id) return;

    removeScript(scriptConfig.gtwUserScriptId);

    const token = sessionStorage.getItem('proxy_token') || getFromCookies('proxy_token');
    if (!token) {
      console.warn('No proxy token found for GTWY user script');
      return;
    }

    const script = createScript({
      id: scriptConfig.gtwUserScriptId,
      src: scriptConfig.gtwScriptUrl,
      attributes: {
        skipLoadGtwy: "true",
        token: token,
        org_id: resolvedParams.org_id,
        customIframeId: 'gtwyEmbedInterface',
        gtwy_user: "true",
        slide: 'right'
      }
    });

    document.head.appendChild(script);

    return () => {
      removeScript(scriptConfig.gtwUserScriptId);
    };
  }, [resolvedParams?.org_id, scriptConfig, removeScript, createScript]);

  return <>{children}</>;
}