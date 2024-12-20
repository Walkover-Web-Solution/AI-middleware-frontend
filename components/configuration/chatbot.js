import { useCustomSelector } from "@/customHooks/customSelector";
import { useEffect, useMemo } from "react";

const Chatbot = ({ params }) => {
    const { bridgeName, bridgeSlugName, bridgeType, chatbot_token, variablesKeyValue, configuration, service, model} = useCustomSelector((state) => ({
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
        bridgeSlugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
        chatbot_token: state?.ChatBot?.chatbot_token || '',
        variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.variables || [],
        configuration: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration,
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service?.toLowerCase(),
        model: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.model,
    }));
    
    const variables = useMemo(() => {
        return variablesKeyValue.reduce((acc, pair) => {
            if (pair.key && pair.value && pair.checked) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {});
    }, [variablesKeyValue]);

    useEffect(() => { //todo change the appoarch
        const sendWithDelay = () => {
            if (bridgeSlugName && window?.SendDataToChatbot) {
                SendDataToChatbot({
                    "threadId": bridgeName
                });
            }
        };

        sendWithDelay(); // Send on refresh

        const delayTimeout = setTimeout(() => {
            sendWithDelay(); // Send with delay
        }, 1000); // Delay of 1000ms or 1 second

        return () => clearTimeout(delayTimeout);
    }, [bridgeSlugName, bridgeName]);

    useEffect(() => {
        if (bridgeName && window?.SendDataToChatbot) {
            SendDataToChatbot({
                "bridgeName": bridgeSlugName
            });
        }
    }, [bridgeName]);

    useEffect(() => {
        if (variables && window?.SendDataToChatbot) {
            window.SendDataToChatbot({
                "variables": variables
            });
        }
    }, [variables]);

    useEffect(() => {
        if (service && configuration && window?.SendDataToChatbot) {
            window.SendDataToChatbot({
                "configuration": configuration
            });
        }
    }, [service, configuration,model]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (window?.SendDataToChatbot && window.openChatbot && document.getElementById('parentChatbot') && bridgeName && bridgeType) {
                window.SendDataToChatbot({
                    "bridgeName": bridgeSlugName,
                    "threadId": bridgeName?.replaceAll(" ", ""),
                    "parentId": 'parentChatbot',
                    "fullScreen": true,
                    "hideCloseButton": true,
                    "hideIcon": true,
                    "variables": variables || {}
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

    return null;
};

export default Chatbot;