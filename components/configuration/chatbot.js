import { useCustomSelector } from "@/customHooks/customSelector";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingSpinner from "@/components/loadingSpinner";

const Chatbot = ({ params, searchParams }) => {
  const [isLoading, setIsLoading] = useState(true); 
  const { bridgeName, bridgeSlugName, bridgeType, chatbot_token, variablesKeyValue, configuration, modelInfo, service } = useCustomSelector((state) => ({
    bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
    bridgeSlugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
    bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    chatbot_token: state?.ChatBot?.chatbot_token || '',
    variablesKeyValue: state?.variableReducer?.VariableMapping?.[params?.id]?.[searchParams?.version]?.variables || [],
    configuration: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration,
    service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.service,
  }));

  // Convert variables array to object
  const variables = useMemo(() => {
    return variablesKeyValue.reduce((acc, pair) => {
      if (pair.key && pair.value) {
        acc[pair.key] = pair.value;
      }
      return acc;
    }, {});
  }, [variablesKeyValue]);


  // Send bridge name as threadId when it changes
  useEffect(() => {
    if (bridgeName && window?.SendDataToChatbot) {
      window.SendDataToChatbot({ 
        "threadId": bridgeName?.replaceAll(" ", "_"), 
      });
    }
  }, [bridgeName]);

  // Send bridge slug name when it changes
  useEffect(() => {
    if (bridgeSlugName && window?.SendDataToChatbot) {
      window.SendDataToChatbot({ 
        bridgeName: bridgeSlugName 
      });
    }
  }, [bridgeSlugName]);
  
  // Send vision config when it changes
  useEffect(() => {
    if (window?.SendDataToChatbot) {
      window.SendDataToChatbot({ 
        modelChanged: configuration?.model 
      });
    }
  }, [configuration?.model]);

  useEffect(() => {
    if (window?.SendDataToChatbot) {
      window.SendDataToChatbot({ 
        serviceChanged: service 
      });
    }
  }, [service]);



  // Send variables when they change
  useEffect(() => {
    if (window?.SendDataToChatbot) {
      window.SendDataToChatbot({ 
        variables: variables 
      });
    }
  }, [variables]);

  // Initialize chatbot when all required data is available
  useEffect(() => {
    if (!bridgeName || !bridgeSlugName || !searchParams?.version) {
      return;
    }

    const intervalId = setInterval(() => {
      if (window?.SendDataToChatbot) {
        // Send all configuration data
        window.SendDataToChatbot({
          "bridgeName": bridgeSlugName,
          "threadId": bridgeName?.replaceAll(" ", "_"),
          "parentId": 'parentChatbot',
          "fullScreen": true,
          "hideCloseButton": false,
          "hideIcon": true,
          "version_id": searchParams?.version,
          "variables": variables || {}
        });
        clearInterval(intervalId);
      }
    }, 300);

  }, [chatbot_token, searchParams?.version, bridgeSlugName, bridgeName, variables]);

  return (
    <>
      
    </>
  );
};

export default Chatbot;