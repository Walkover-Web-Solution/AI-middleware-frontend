import React, { createContext, useContext, useMemo } from 'react';

// Performance-optimized context for configuration state
const PerformanceContext = createContext(null);

export const PerformanceProvider = ({ children, value }) => {
  // Memoize context value to prevent unnecessary re-renders
  const memoizedValue = useMemo(() => value, [
    value.uiState,
    value.promptState,
    value.params?.id,
    value.searchParams?.version
  ]);

  return (
    <PerformanceContext.Provider value={memoizedValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within PerformanceProvider');
  }
  return context;
};

// Selective context hooks to minimize re-renders
export const useUiState = () => {
  const { uiState, updateUiState } = usePerformanceContext();
  return { uiState, updateUiState };
};

export const usePromptState = () => {
  const { promptState, setPromptState } = usePerformanceContext();
  return { promptState, setPromptState };
};

export const useConfigParams = () => {
  const { params, searchParams } = usePerformanceContext();
  return { params, searchParams };
};
