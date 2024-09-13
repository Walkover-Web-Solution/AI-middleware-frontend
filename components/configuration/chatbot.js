import { useCustomSelector } from "@/customSelector/customSelector";
import { useEffect, useMemo } from "react";

const Chatbot = ({ params }) => {

    const { bridgeName, bridgeSlugName, chatbot_token, variablesKeyValue } = useCustomSelector((state) => ({
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
        bridgeSlugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
        chatbot_token: state?.ChatBot?.chatbot_token || '',
        variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || [],
    }));

    const variables = useMemo(() => {
        return variablesKeyValue.reduce((acc, pair) => {
            if (pair.key && pair.value) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {});
    }, [variablesKeyValue]);

    useEffect(() => {
        if (bridgeSlugName && window?.SendDataToChatbot) {
            SendDataToChatbot({
                bridgeName: bridgeSlugName
            });
        }
    }, [bridgeSlugName]);

    useEffect(() => {
        if (variables && window?.SendDataToChatbot) {
            window.SendDataToChatbot({
                variables: variables
            });
        }
    }, [variables])

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (window?.SendDataToChatbot && window.openChatbot && document.getElementById('parentChatbot')) {
                clearInterval(intervalId);
                window.SendDataToChatbot({
                    bridgeName: bridgeSlugName,
                    threadId: bridgeName.replaceAll(" ", ""),
                    variables: {},
                    parentId: 'parentChatbot',
                    fullScreen: true,
                    hideCloseButton: true,
                    hideIcon: true,
                    variables: variables || {}
                });
                window.openChatbot();
            }
        }, 100); // Check every 100ms

        return () => {
            clearInterval(intervalId);
            if (typeof window.closeChatbot === "function") {
                SendDataToChatbot({
                    parentId: '',
                    fullScreen: false,
                });
                setTimeout(() => {
                    closeChatbot();
                }, 0);
            }
        };
    }, [chatbot_token]);

    return (
        <p>Loading....</p>
    )
};

export default Chatbot;