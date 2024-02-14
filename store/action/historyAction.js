import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer } from "../reducer/historyReducer";



export const getHistoryAction = () => async (dispatch, getState) => {
    try {
        const dataToSend = {
            "org_id":"124dfgh67ghj"
        }
      const data = await axios.post(`http://localhost:7072/api/v1/config/history/6ae25830-c74a-11ee-afda-7b5d9670126d/` , dataToSend );
      dispatch(fetchAllHistoryReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };


  export const getThread = () => async (dispatch, getState) => {
    try {
        const dataToSend = {
            "org_id":"124dfgh67ghj"
        }
      const data = await axios.post(`http://localhost:7072/api/v1/config/threads/123456789fdss/6ae25830-c74a-11ee-afda-7b5d9670126d/` , dataToSend );
      dispatch(fetchThreadReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };