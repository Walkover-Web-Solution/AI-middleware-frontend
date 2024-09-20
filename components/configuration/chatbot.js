import { useCustomSelector } from "@/customHooks/customSelector";
import { useEffect, useMemo } from "react";

const Chatbot = ({ params }) => {

    const { bridgeName, bridgeSlugName, bridgeType, chatbot_token, variablesKeyValue } = useCustomSelector((state) => ({
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
        bridgeSlugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
        chatbot_token: state?.ChatBot?.chatbot_token || '',
        variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || [],
    }));

    const variables = useMemo(() => {
        return variablesKeyValue.reduce((acc, pair) => {
            if (pair.key && pair.value && pair.checked) {
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
                if (bridgeType === 'chatbot') window.openChatbot();
                clearInterval(intervalId);
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

    return null
};

export default Chatbot;