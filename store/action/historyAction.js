import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer, updateHistoryMessageReducer } from "../reducer/historyReducer";
import { getHistory, getSingleThreadData, updateHistoryMessage } from "@/config";



export const getHistoryAction = (id, start, end, page = 1, keyword = '') => async (dispatch, getState) => {
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




export const getThread = (thread_id, id) => async (dispatch, getState) => {
  try {
    const data = await getSingleThreadData(thread_id, id);
    dispatch(fetchThreadReducer(data.data));
  } catch (error) {
    console.error(error);
  }
};

export const updateContentHistory = ({id,bridge_id,message,index}) => async (dispatch,getState)=>{
  try {
  const data = await updateHistoryMessage({id,bridge_id,message});
  dispatch(updateHistoryMessageReducer({data:data.result.data,index}));
   
  } catch (error) {
    console.error(error)
  }
} 