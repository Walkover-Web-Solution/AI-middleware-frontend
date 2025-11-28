import { getHistory, getSingleThreadData, getSubThreadIds, getThreads, searchMessageHistory, updateHistoryMessage, userFeedbackCount } from "@/config";
import { 
  fetchAllHistoryReducer, 
  fetchSubThreadReducer, 
  fetchThreadReducer, 
  updateHistoryMessageReducer, 
  userFeedbackCountReducer,
  setSearchQuery,
  setSearchLoading,
  setSearchResults,
  appendSearchResults,
  setSearchHasMore,
  clearSearchResults,
  setSearchDateRange
} from "../reducer/historyReducer";

export const getHistoryAction = (id, page = 1, user_feedback, isErrorTrue, selectedVersion) => async (dispatch) => {
  try {
    const data = await getThreads(id, page, user_feedback, isErrorTrue, selectedVersion );
    if (data && data.data) {
      dispatch(fetchAllHistoryReducer({ data: data.data, page }));
    }
    if(data && data?.total_user_feedback_count)
    {
      dispatch(userFeedbackCountReducer({data:data.total_user_feedback_count}))
    }
    return data.data
  } catch (error) {
    console.error(error);
  }
};

export const getThread = ({threadId, bridgeId, subThreadId ,nextPage,user_feedback, versionId, error}) => async (dispatch) => {
  try {
    const data = await getSingleThreadData(threadId, bridgeId, subThreadId, nextPage,user_feedback, versionId, error);
    dispatch(fetchThreadReducer({ data: data.data, nextPage }));
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const updateContentHistory = ({ id, bridge_id, message, index }) => async (dispatch) => {
  try {
    const data = await updateHistoryMessage({ id, bridge_id, message });
    dispatch(updateHistoryMessageReducer({ data: data?.result?.[0], index }));
    return data;
  } catch (error) {
    console.error(error)
  }
}

export const userFeedbackCountAction = ({bridge_id,user_feedback}) => async(dispatch) =>{
  try {
    const data = await userFeedbackCount({bridge_id,user_feedback});
    
  } catch (error) {
    console.error(error)
  }
}

export const getSubThreadsAction = ({thread_id, error, bridge_id, version_id}) => async (dispatch) =>{
  try {
    const data = await getSubThreadIds({thread_id, error, bridge_id, version_id});
    dispatch(fetchSubThreadReducer({data:data.threads}))

  } catch (error) {
    console.error(error)
  }
}

export const searchMessageHistoryAction = ({
  bridgeId, 
  keyword, 
  time_range = null, 
  startDate = null,
  endDate = null
}) => async(dispatch) => {
  try {
    dispatch(setSearchLoading(true));
    if (keyword) {
      dispatch(setSearchQuery(keyword));
    }
    if (startDate || endDate) {
      dispatch(setSearchDateRange({ start: startDate, end: endDate }));
    }
    const timeRange = time_range || (startDate && endDate ? { start: startDate, end: endDate } : null);
    const data = await searchMessageHistory(bridgeId, keyword, timeRange);
    if (data && data.data) {
      const searchData = Array.isArray(data.data?.data) ? data.data.data : [];
      dispatch(setSearchResults({ data: searchData, page: 1 }));
      dispatch(setSearchHasMore(false));
    } else {
      dispatch(setSearchResults({ data: [], page: 1 }));
      dispatch(setSearchHasMore(false));
    }
    
    return data;
  } catch (error) {
    console.error('Search failed:', error);
    dispatch(setSearchLoading(false));
    dispatch(setSearchResults({ data: [], page: 1 }));
    throw error;
  }
};

// Action to clear search
export const clearSearchAction = () => (dispatch) => {
  dispatch(clearSearchResults());
};
