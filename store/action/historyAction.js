import { getHistory, getSingleThreadData, updateHistoryMessage } from "@/config";
import { fetchAllHistoryReducer, fetchThreadReducer, updateHistoryMessageReducer } from "../reducer/historyReducer";

export const getHistoryAction = (id, start, end, page = 1, keyword = '') => async (dispatch) => {
  try {
    const data = await getHistory(id, page, start, end, keyword);
    if (data && data.data) {
      dispatch(fetchAllHistoryReducer({ data: data.data, page }));
      return data.data; // Return the data for further checks
    }
  } catch (error) {
    console.error(error);
  }
};

export const getThread = (thread_id, id) => async (dispatch) => {
  try {
    const data = await getSingleThreadData(thread_id, id);
    dispatch(fetchThreadReducer(data.data));
  } catch (error) {
    console.error(error);
  }
};

export const updateContentHistory = ({ id, bridge_id, message, index }) => async (dispatch) => {
  try {
    const data = await updateHistoryMessage({ id, bridge_id, message });
    dispatch(updateHistoryMessageReducer({ data: data?.result?.[0], index }));
  } catch (error) {
    console.error(error)
  }
}