import { useCustomSelector } from "@/customSelector/customSelector";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Chatbot = ({ params }) => {

    const { bridge } = useCustomSelector((state) => ({
        chatbotData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.chatbotData,
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    useEffect(() => {
        if (window && typeof window.SendDataToChatbot === 'function') {
            window?.SendDataToChatbot({
                bridgeName: bridge?.slugName,
                threadId: bridge?.name.replaceAll(" ", ""),
                variables: {},
                // parentId: 'parentChatbot',
                // fullScreen: true
            });
            window.openChatbot()
        }
        return () => {
            if (window && typeof window.closeChatbot === "function") {
                window.SendDataToChatbot({
                    // parentId: '',
                    fullScreen: false
                });
                window.closeChatbot()
            }
        }
    }, [bridge])

    return (
        <div >hello</div>
    )
};

export default Chatbot;