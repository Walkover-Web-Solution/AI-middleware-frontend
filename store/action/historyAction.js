import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer } from "../reducer/historyReducer";
import { getHistory, getSingleThreadData } from "@/config";



export const getHistoryAction = (id,start, end,page=1) => async (dispatch, getState) => {
  try {
    const data = await getHistory(id, page, start , end );
    if (data && data.data) {
      dispatch(fetchAllHistoryReducer({ data: data.data, page }));
      return data.data; // Return the data for further checks
    }
  } catch (error) {
    console.error(error);
  }
};




export const getThread = (thread_id, id) => async (dispatch, getState) => {
  try {
    const data = await getSingleThreadData(thread_id, id);
    dispatch(fetchThreadReducer(data.data));
  } catch (error) {
    console.error(error);
  }
};