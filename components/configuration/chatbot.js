import { useCustomSelector } from "@/customHooks/customSelector";
import { useEffect, useMemo } from "react";

const Chatbot = ({ params }) => {
  const { bridgeName, bridgeSlugName, bridgeType, chatbot_token, variablesKeyValue, configuration } = useCustomSelector((state) => ({
    bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
    bridgeSlugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
    bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    chatbot_token: state?.ChatBot?.chatbot_token || '',
    variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.variables || [],
    configuration: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration
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
    if (bridgeName && window?.SendDataToChatbot) {
      SendDataToChatbot({
        "threadId": bridgeName
      });
    }
  }, [bridgeName]);

  useEffect(() => {
    if (bridgeSlugName && window?.SendDataToChatbot) {
      SendDataToChatbot({
        "bridgeName": bridgeSlugName
      });
    }
  }, [bridgeSlugName]);

  useEffect(() => { //todo change the appoarch
    if (configuration?.vision && window?.SendDataToChatbot) {
      SendDataToChatbot({
        "vision": { "vision": true }
      })
    }
    else if (window?.SendDataToChatbot) {
      SendDataToChatbot({
        "vision": { "vision": false }
      })
    }
  }, [configuration]);

  useEffect(() => {
    if (variables && window?.SendDataToChatbot) {
      window.SendDataToChatbot({
        "variables": variables
      });
    }
  }, [variables]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window?.SendDataToChatbot && window.openChatbot && document.getElementById('parentChatbot') && bridgeName && bridgeSlugName && bridgeType && params?.version) {
        window.SendDataToChatbot({
          "bridgeName": bridgeSlugName,
          "threadId": bridgeName?.replaceAll(" ", "_"),
          "parentId": 'parentChatbot',
          "fullScreen": true,
          "hideCloseButton": true,
          "hideIcon": true,
          "version_id": params?.version,
          "variables": variables || {}
        });
        setTimeout(() => {
          if (bridgeType === 'chatbot') window.openChatbot();
        }, 200);
        clearInterval(intervalId);
      }
    }, 300); // Check every 100ms

    return () => {
      clearInterval(intervalId);
      // if (typeof window.closeChatbot === "function") {
      //     SendDataToChatbot({
      //         parentId: '',
      //         fullScreen: false,
      //     });
      //     setTimeout(() => {
      //         closeChatbot();
      //     }, 0);
      // }
    };
  }, [chatbot_token]);

  return null;
};

export default Chatbot;