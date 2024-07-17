import { useCustomSelector } from "@/customSelector/customSelector";
import { useEffect } from "react";

const Chatbot = ({ params }) => {

    const { bridge, chatbot_token } = useCustomSelector((state) => ({
        chatbotData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.chatbotData,
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
        chatbot_token: state?.ChatBot?.chatbot_token || ''
    }));

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (window?.SendDataToChatbot && window.openChatbot && document.getElementById('parentChatbot')) {
                clearInterval(intervalId);
                window.SendDataToChatbot({
                    bridgeName: bridge?.slugName,
                    threadId: bridge?.name.replaceAll(" ", ""),
                    variables: {},
                    parentId: 'parentChatbot',
                    fullScreen: true,
                    hideCloseButton: true
                });
                window.openChatbot();
            }
        }, 100); // Check every 100ms

        return () => {
            clearInterval(intervalId);
            if (typeof window.closeChatbot === "function") {
                window.SendDataToChatbot({
                    parentId: '',
                    fullScreen: false
                });
                window.closeChatbot();
            }
        };
    }, [chatbot_token]);

    return (
        <p>Loading....</p>
    )
};

export default Chatbot;