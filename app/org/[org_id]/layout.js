"use client";
import Navbar from "@/components/navbar";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getAllResponseTypesAction } from "@/store/action/bridgeAction";
import { getAllChatBotAction } from "@/store/action/chatBotAction";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function layoutOrgPage({ children, params }) {
    const dispatch = useDispatch()
    const { chatbot_token } = useCustomSelector((state) => ({
        chatbot_token: state?.ChatBot?.chatbot_token || ''
    }));

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
        dispatch(getAllResponseTypesAction(params.org_id));
    }, []);

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
