import { useCallback, useMemo, useRef } from 'react';
import { useCustomSelector } from './customSelector';
import { shallowEqual } from 'react-redux';

// Performance-optimized selector with memoization and shallow comparison
export const useOptimizedSelector = (selector, dependencies = []) => {
  const previousResultRef = useRef();
  const selectorRef = useRef(selector);
  
  // Update selector ref when dependencies change
  const dependenciesRef = useRef(dependencies);
  const hasDependenciesChanged = !shallowEqual(dependenciesRef.current, dependencies);
  
  if (hasDependenciesChanged) {
    selectorRef.current = selector;
    dependenciesRef.current = dependencies;
  }
  
  // Use the stable selector reference
  const result = useCustomSelector(selectorRef.current, shallowEqual);
  
  // Additional memoization layer for complex objects
  const memoizedResult = useMemo(() => {
    if (previousResultRef.current && shallowEqual(previousResultRef.current, result)) {
      return previousResultRef.current;
    }
    previousResultRef.current = result;
    return result;
  }, [result]);
  
  return memoizedResult;
};

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
      
      return {
        prompt: versionData?.configuration?.prompt || "",
        service: versionData?.service || "",
        serviceType: versionData?.configuration?.type || "",
        variablesKeyValue: versionData?.variables || [],
        bridge: versionData || ""
      };
    }, [paramsId, version]),
    shallowEqual
  );
};
