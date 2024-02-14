import axios from "axios";
import { fetchModelReducer } from "../reducer/modelReducer";


export const getModelAction = () => async (dispatch, getState) => {
    try {
      const data = await axios.get(`http://localhost:7072/api/v1/config/models/`);
      console
      dispatch(fetchModelReducer(data.data));
    } catch (error) {
      console.error(error);
    }
  };