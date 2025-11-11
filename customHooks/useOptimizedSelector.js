import { useCallback } from 'react';
import { useCustomSelector } from './customSelector';
import { shallowEqual } from 'react-redux';

// Specialized selector for configuration state
export const useConfigurationSelector = (params, searchParams) => {
  const paramsId = params?.id;
  const version = searchParams?.version;
  
  return useCustomSelector(
    useCallback((state) => {
      const bridgeData = state?.bridgeReducer?.allBridgesMap?.[paramsId];
      const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[paramsId]?.[version];
      
      return {
        bridgeType: bridgeData?.bridgeType,
        versionService: versionData?.service,
        bridgeName: bridgeData?.name,
        reduxPrompt: versionData?.configuration?.prompt || "",
        bridge: versionData || {},
        isFocus: state?.bridgeReducer?.isFocus,
        modelType: versionData?.configuration?.type?.toLowerCase(),
        modelName: versionData?.configuration?.model,
      };
    }, [paramsId, version]),
    shallowEqual
  );
};

// Specialized selector for prompt-related state
export const usePromptSelector = (params, searchParams) => {
  const paramsId = params?.id;
  const version = searchParams?.version;
  
  return useCustomSelector(
    useCallback((state) => {
      const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[paramsId]?.[version];
      const variableState =
        state?.variableReducer?.VariableMapping?.[paramsId]?.[version] || {};
      
      return {
        prompt: versionData?.configuration?.prompt || "",
        service: versionData?.service || "",
        serviceType: versionData?.configuration?.type || "",
        variablesKeyValue: variableState?.variables || [],
        bridge: versionData || ""
      };
    }, [paramsId, version]),
    shallowEqual
  );
};
