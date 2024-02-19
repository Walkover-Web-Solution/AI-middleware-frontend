import axios from "axios";
import { fetchAllHistoryReducer, fetchThreadReducer } from "../reducer/historyReducer";



export const getHistoryAction = (id) => async (dispatch, getState) => {
    try {
      const headers = {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.sKbA7M0mmWG1A6Rk41t1KapUAc3WpKv0xHPzdWPxh7Q'
      };
      const data = await axios.get(`http://localhost:7072/api/v1/config/history/${id}/` , { headers } );
      dispatch(fetchAllHistoryReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };


  export const getThread = (thread_id , id) => async (dispatch, getState) => {
    try {
      
      const headers = {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.sKbA7M0mmWG1A6Rk41t1KapUAc3WpKv0xHPzdWPxh7Q'
      };
      const data = await axios.get(`http://localhost:7072/api/v1/config/threads/${thread_id}/${id}/` ,  { headers } );
      dispatch(fetchThreadReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };