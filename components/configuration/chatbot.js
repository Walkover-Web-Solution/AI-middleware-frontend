import { useCustomSelector } from "@/customHooks/customSelector";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingSpinner from "@/components/loadingSpinner";

const Chatbot = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true); 
  const { bridgeName, bridgeSlugName, bridgeType, chatbot_token, variablesKeyValue, configuration, modelInfo, service } = useCustomSelector((state) => ({
    bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
    bridgeSlugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
    bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    chatbot_token: state?.ChatBot?.chatbot_token || '',
    variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.variables || [],
    configuration: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration,
    service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service,
    modelInfo: state?.modelReducer?.serviceModels
  }));

  const bridgeNameRef = useRef(bridgeName);
  const bridgeSlugNameRef = useRef(bridgeSlugName);
  const bridgeTypeRef = useRef(bridgeType);
  const variablesKeyValueRef = useRef(variablesKeyValue);
  const configurationRef = useRef(configuration);
  const isVision = modelInfo?.[service]?.[configurationRef?.current?.type]?.[configurationRef?.current?.model]?.validationConfig?.vision;

  useEffect(() => {
    bridgeNameRef.current = bridgeName;
    bridgeSlugNameRef.current = bridgeSlugName;
    bridgeTypeRef.current = bridgeType;
    variablesKeyValueRef.current = variablesKeyValue;
    configurationRef.current = configuration;
  }, [bridgeName, bridgeSlugName, bridgeType, variablesKeyValue, configuration]);

  const variables = useMemo(() => {
    return variablesKeyValueRef.current.reduce((acc, pair) => {
      if (pair.key && pair.value) {
        acc[pair.key] = pair.value;
      }
      return acc;
    }, {});
  }, [variablesKeyValueRef.current]);

  useEffect(() => {
    if (bridgeNameRef.current && window?.SendDataToChatbot) {
      SendDataToChatbot({ 
        "threadId": bridgeNameRef.current 
      });
    }
  }, [bridgeNameRef.current]);

  useEffect(() => {
    if (bridgeSlugNameRef.current && window?.SendDataToChatbot) {
      SendDataToChatbot({ bridgeName: bridgeSlugNameRef.current });
    }
  }, [bridgeSlugNameRef.current]);
  
  useEffect(() => {
    if (isVision && window?.SendDataToChatbot) {
      SendDataToChatbot({ vision: { vision: true } });
    } else if (window?.SendDataToChatbot) {
      SendDataToChatbot({ vision: { vision: false } });
    }
  }, [isVision,configurationRef.current?.model, service]);

  useEffect(() => {
    if (variables && window?.SendDataToChatbot) {
      window.SendDataToChatbot({ variables: variables });
    }
  }, [variables]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        window?.SendDataToChatbot &&
        window.openChatbot &&
        document.getElementById('parentChatbot') &&
        bridgeNameRef.current &&
        bridgeSlugNameRef.current &&
        bridgeTypeRef.current &&
        params?.version
      ) {
        window.SendDataToChatbot({
          "bridgeName": bridgeSlugNameRef.current,
          "threadId": bridgeNameRef.current?.replaceAll(" ", "_"),
          "parentId": 'parentChatbot',
          "fullScreen": true,
         "hideCloseButton": true,
          "hideIcon": true,
          "version_id": params?.version,
          "variables": variables || {}
        });
        setTimeout(() => {
          if (bridgeTypeRef.current === 'chatbot') {
           if( window.openChatbot()){
              setIsLoading(false);
           }
          }
        }, 500);
     clearInterval(intervalId);
      }
    }, 300);

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
    }

  }, [chatbot_token]);

 return (
  <>
    {isLoading ? (
      <div
        id="chatbot-loader"
        className="flex flex-col gap-4 justify-center items-center h-full w-full bg-white text-black"
      >
        <p className="text-lg font-semibold animate-pulse">Loading chatbot...</p>
        
      </div>
    ) : null}
  </>
);
};

export default Chatbot;
