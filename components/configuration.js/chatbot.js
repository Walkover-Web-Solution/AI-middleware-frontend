import { useCustomSelector } from "@/customSelector/customSelector";
import { Fullscreen } from "lucide-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Chatbot = ({ params }) => {

    const dispatch = useDispatch()
    const { slugName, chatbotData, chatbot_token } = useCustomSelector((state) => ({
        slugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
        chatbotData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.chatbotData,

    }));



    return (
        <button onClick={() => window.SendDataToChatbot({
            bridgeName: slugName,
            parentId: "parentChatbot",
            fullScreen: true
        })}> hello</button>
    )
};

export default Chatbot;