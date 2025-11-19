import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from './customSelector';
import { 
  getHistoryAction, 
  getSubThreadsAction, 
  searchMessageHistoryAction,
  userFeedbackCountAction 
} from '@/store/action/historyAction';
import { 
  clearThreadData, 
  clearHistoryData, 
  clearSearchResults, 
  clearSubThreadData,
  setSearchQuery,
  setSelectedVersion 
} from '@/store/reducer/historyReducer';

/**
 * Custom hook for managing history data and operations
 * Centralizes all history-related state management and API calls
 */
export const useHistoryData = (params, searchParams) => {
  const dispatch = useDispatch();
  
  // Stabilize parameters to prevent unnecessary re-renders
  const stableParamId = useMemo(() => params?.id, [params?.id]);
  const stableVersion = useMemo(() => searchParams?.version, [searchParams?.version]);
  
  // Memoized selector to prevent unnecessary re-renders
  const historyState = useCustomSelector(state => ({
    historyData: Array.isArray(state?.historyReducer?.history) ? state.historyReducer.history : [],
    thread: Array.isArray(state?.historyReducer?.thread) ? state.historyReducer.thread : [],
    subThreads: Array.isArray(state?.historyReducer?.subThreads) ? state.historyReducer.subThreads : [],
    searchResults: Array.isArray(state?.historyReducer?.searchResults) ? state.historyReducer.searchResults : [],
    searchQuery: state?.historyReducer?.searchQuery || "",
    isSearchActive: state?.historyReducer?.isSearchActive || false,
    searchLoading: state?.historyReducer?.searchLoading || false,
    hasMoreSearchResults: state?.historyReducer?.hasMoreSearchResults || false,
    selectedVersion: state?.historyReducer?.selectedVersion || 'all',
    userFeedbackCount: state?.historyReducer?.userFeedbackCount,
    bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[stableParamId]?.versions || [],
    previousPrompt: state?.bridgeReducer?.bridgeVersionMapping?.[stableParamId]?.[stableVersion]?.configuration?.prompt || ""
  }), [stableParamId, stableVersion]);

  // Memoized data processing
  const processedData = useMemo(() => {
    const { historyData, searchResults, isSearchActive } = historyState;
    
    return {
      displayData: isSearchActive ? searchResults : historyData,
      hasData: isSearchActive ? searchResults.length > 0 : historyData.length > 0,
      isEmpty: isSearchActive ? searchResults.length === 0 : historyData.length === 0
    };
  }, [historyState.historyData, historyState.searchResults, historyState.isSearchActive]);

  // Optimized fetch functions with error handling
  const fetchHistory = useCallback(async (options = {}) => {
    const {
      bridgeId = stableParamId,
      startDate = null,
      endDate = null,
      page = 1,
      keyword = null,
      filterOption = 'all',
      isError = false,
      version = 'all'
    } = options;

    try {
      const result = await dispatch(getHistoryAction(
        bridgeId, startDate, endDate, page, keyword, filterOption, isError, version
      ));
      return result;
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return [];
    }
  }, [dispatch, stableParamId]);

  const fetchSubThreads = useCallback(async (threadId, options = {}) => {
    const {
      bridgeId = stableParamId,
      version = historyState.selectedVersion,
      isError = false
    } = options;

    try {
      await dispatch(getSubThreadsAction({ 
        thread_id: threadId, 
        error: isError, 
        bridge_id: bridgeId, 
        version_id: version 
      }));
    } catch (error) {
      console.error('Failed to fetch sub threads:', error);
    }
  }, [dispatch, stableParamId, historyState.selectedVersion]);

  const searchMessages = useCallback(async (keyword, options = {}) => {
    const {
      bridgeId = stableParamId,
      timeRange = null
    } = options;

    try {
      const result = await dispatch(searchMessageHistoryAction({
        bridgeId,
        keyword,
        time_range: timeRange
      }));
      return result;
    } catch (error) {
      console.error('Failed to search messages:', error);
      return [];
    }
  }, [dispatch, stableParamId]);

  const fetchUserFeedbackCount = useCallback(async (userFeedback = 'all') => {
    try {
      await dispatch(userFeedbackCountAction({ 
        bridge_id: stableParamId, 
        user_feedback: userFeedback 
      }));
    } catch (error) {
      console.error('Failed to fetch user feedback count:', error);
    }
  }, [dispatch, stableParamId]);

  // Cleanup functions
  const clearAllData = useCallback(() => {
    dispatch(clearThreadData());
    dispatch(clearHistoryData());
    dispatch(clearSearchResults());
    dispatch(clearSubThreadData());
    dispatch(setSelectedVersion('all'));
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  // State setters
  const updateSearchQuery = useCallback((query) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const updateSelectedVersion = useCallback((version) => {
    dispatch(setSelectedVersion(version));
  }, [dispatch]);

  return {
    // State
    ...historyState,
    ...processedData,
    
    // Actions
    fetchHistory,
    fetchSubThreads,
    searchMessages,
    fetchUserFeedbackCount,
    clearAllData,
    clearSearch,
    updateSearchQuery,
    updateSelectedVersion,
    
    // Dispatch for direct access if needed
    dispatch
  };
};

export default useHistoryData;
