import { useCustomSelector } from "@/customSelector/customSelector";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Chatbot = ({ params }) => {

    const { bridge } = useCustomSelector((state) => ({
        chatbotData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.chatbotData,
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (window.SendDataToChatbot) {
                clearInterval(intervalId);
                if (typeof window.SendDataToChatbot === 'function' && document.getElementById('parentChatbot')) {
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
    }, []);

    return (
        <p>Loading....</p>
    )
};

export default Chatbot;