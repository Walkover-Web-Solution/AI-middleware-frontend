import { useCustomSelector } from "./customSelector";

export const useConfigurationState = (params, searchParams) => {
    return useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const service = versionData?.service;
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        
        return {
            bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.trim()?.toLowerCase() || 'api',
            modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.type?.toLowerCase(),
            reduxPrompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt,
            modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.model,
            showConfigType: state.userDetailsReducer.userDetails.showConfigType,
            showDefaultApikeys: state.userDetailsReducer.userDetails.addDefaultApiKeys,
            shouldToolsShow: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.tools,
            bridgeApiKey: versionData?.apikey_object_id?.[
                service === 'openai_response' ? 'openai' : service
            ],
            shouldPromptShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.system_prompt,
            bridge_functions: versionData?.function_ids || [],
            connect_agents: versionData?.connected_agents || {},
            knowbaseVersionData: versionData?.doc_ids || [],
            hideAdvancedParameters: state.userDetailsReducer.userDetails.hideAdvancedParameters,
            hideAdvancedConfigurations: state.userDetailsReducer.userDetails.hideAdvancedConfigurations,
            service: service,
            hidePreTool: state.userDetailsReducer.userDetails.hidePreTool,
        };
    });
};
