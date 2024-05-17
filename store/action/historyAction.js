import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer } from "../reducer/historyReducer";
import { getHistory, getSingleThreadData } from "@/config";



export const getHistoryAction = (id) => async (dispatch, getState) => {
    try {
      const data = await getHistory(id);
      dispatch(fetchAllHistoryReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };


  export const getThread = (thread_id , id) => async (dispatch, getState) => {
    try {
      const data = await getSingleThreadData(thread_id , id);
      dispatch(fetchThreadReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };