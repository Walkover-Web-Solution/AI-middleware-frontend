import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer } from "../reducer/historyReducer";



export const getHistoryAction = (id) => async (dispatch, getState) => {
    try {
      const data = await axios.get(`http://localhost:7072/api/v1/config/history/${id}/` , );
      dispatch(fetchAllHistoryReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };


  export const getThread = (thread_id , id) => async (dispatch, getState) => {
    try {
      
      const data = await axios.get(`http://localhost:7072/api/v1/config/threads/${thread_id}/${id}/` );
      dispatch(fetchThreadReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };