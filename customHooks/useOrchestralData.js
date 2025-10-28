import { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createNodesFromAgentDoc } from '@/components/flowDataManager';
import { getAllOrchestralFlowAction } from '@/store/action/orchestralFlowAction';

/**
 * Custom hook for managing orchestral flow data
 * Handles data fetching, processing, and memoization
 * @param {string} orgId - Organization ID
 * @param {string} orchestralId - Orchestral flow ID
 * @returns {Object} Orchestral data and processed nodes
 */
export const useOrchestralData = (orgId, orchestralId) => {
  const dispatch = useDispatch();
  
  // Fetch orchestral flow data from Redux store
  const orchestralFlowData = useCustomSelector((state) =>
    state.orchestralFlowReducer.orchetralFlowData[orgId] || []
  );

  // Fetch data if not available
  useEffect(() => {
    if (orgId && !orchestralFlowData.length) {
      dispatch(getAllOrchestralFlowAction(orgId));
    }
  }, [dispatch, orgId, orchestralFlowData.length]);

  // Find specific orchestral data by ID
  const orchestralData = useMemo(() => {
    if (!orchestralFlowData.length || !orchestralId) {
      return null;
    }
    const found = orchestralFlowData.find((item) => item._id === orchestralId);
    return found;
  }, [orchestralFlowData, orchestralId]);

  // Process updated data with memoization
  const updatedData = useMemo(() => {
    if (!orchestralData) return null;
    
    // Handle different data structures
    let dataToProcess;
    if (orchestralData?.data) {
      dataToProcess = orchestralData.data;
    } else if (orchestralData?.nodes || orchestralData?.edges) {
      dataToProcess = orchestralData;
    } else {
      // Fallback for legacy data structure
      dataToProcess = orchestralData;
    }
    
    try {
      const processedData = createNodesFromAgentDoc(dataToProcess);
      return processedData;
    } catch (error) {
      console.error('Error processing orchestral data:', error);
      
      // Return a basic fallback structure with just nodes/edges if they exist
      if (dataToProcess?.nodes || dataToProcess?.edges) {
        return {
          nodes: dataToProcess.nodes || [],
          edges: dataToProcess.edges || []
        };
      }
      
      // Return the raw data as fallback
      return dataToProcess;
    }
  }, [orchestralData]);

  // Process discarded data with memoization
  const discardedData = useMemo(() => {
    if (!orchestralData) return null;
    
    try {
      return createNodesFromAgentDoc(orchestralData);
    } catch (error) {
      console.error('Error processing discarded data:', error);
      return null;
    }
  }, [orchestralData]);

  // Extract orchestral metadata
  const orchestralMetadata = useMemo(() => {
    if (!orchestralData) return {};
    return {
      name: orchestralData.flow_name,
      description: orchestralData.flow_description,
      isDrafted: orchestralData.status === 'draft',
      status: orchestralData.status
    };
  }, [orchestralData]);

  // Loading and error states
  const isLoading = !orchestralFlowData.length && orgId; // Loading if we have orgId but no data
  const hasError = orchestralId && orchestralFlowData.length > 0 && !orchestralData;

  return {
    orchestralData,
    updatedData,
    discardedData,
    orchestralMetadata,
    isLoading,
    hasError,
    // Raw data for debugging
    rawOrchestralFlowData: orchestralFlowData
  };
};

export default useOrchestralData;
