import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer } from "../reducer/historyReducer";



export const getHistoryAction = (id) => async (dispatch, getState) => {
    try {
        const dataToSend = {
            "org_id":"124dfgh67ghj"
        }
      const data = await axios.get(`http://localhost:7072/api/v1/config/history/${id}/` , dataToSend );
      dispatch(fetchAllHistoryReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };


  export const getThread = (thread_id , id) => async (dispatch, getState) => {
    try {
      
        const dataToSend = {
            "org_id":"124dfgh67ghj"
        }
      const data = await axios.get(`http://localhost:7072/api/v1/config/threads/${thread_id}/${id}/` , dataToSend );
      dispatch(fetchThreadReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };