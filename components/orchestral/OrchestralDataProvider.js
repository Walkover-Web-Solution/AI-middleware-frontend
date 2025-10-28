import React, { createContext, useContext } from 'react';
import { useOrchestralData } from '@/customHooks/useOrchestralData';

/**
 * Context for orchestral data
 */
const OrchestralDataContext = createContext(null);

/**
 * Hook to use orchestral data context
 * @returns {Object} Orchestral data context
 */
export const useOrchestralDataContext = () => {
  const context = useContext(OrchestralDataContext);
  if (!context) {
    throw new Error('useOrchestralDataContext must be used within OrchestralDataProvider');
  }
  return context;
};

/**
 * Provider component for orchestral data
 * Centralizes data management and provides context to child components
 * @param {Object} props - Component props
 * @param {string} props.orgId - Organization ID
 * @param {string} props.orchestralId - Orchestral flow ID
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const OrchestralDataProvider = ({ orgId, orchestralId, children }) => {
  const orchestralData = useOrchestralData(orgId, orchestralId);

  return (
    <OrchestralDataContext.Provider value={orchestralData}>
      {children}
    </OrchestralDataContext.Provider>
  );
};

export default OrchestralDataProvider;
