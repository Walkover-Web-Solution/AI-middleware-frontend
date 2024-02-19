import { createBridgeReducer, fetchAllBridgeReducer, fetchSingleBridgeReducer, updateBridgeReducer } from "../reducer/bridgeReducer";
import axios from "@/utils/interceptor";

//   ---------------------------------------------------- ADMIN ROUTES ---------------------------------------- //
export const getSingleBridgesAction = (id) => async (dispatch, getState) => {
  try {
    const data = await axios.get(`http://localhost:7072/api/v1/config/getbridges/${id}`);
    dispatch(fetchSingleBridgeReducer(data.data.bridges));
  } catch (error) {
    console.error(error);
  }
};

export const createBridgeAction = () => async (dispatch, getState) => {
  try {
    const dataToSend = {
      "configuration": {
        "model": "gpt-3.5-turbo",
        "name": "bridg12",
        "service": "Openai",
        "temperature": 1,
        "prompt": { "system": "hey" },
        "type": "chat"
      },
      "org_id": "124dfgh67ghj"
    }
    const data = await axios.post(`http://localhost:7072/api/v1/config/createbridges`, dataToSend);
    dispatch(createBridgeReducer(data.data.bridges));
  } catch (error) {
    console.error(error);
  }
};

export const getAllBridgesAction = () => async (dispatch, getState) => {
  try {
    const response = await axios.get(`http://localhost:7072/api/v1/config/getbridges/all` ,   );
    // const response = await getAllBridges();
    console.log(response, "response")
    dispatch(fetchAllBridgeReducer(response.data.bridges));
  } catch (error) {
    console.error(error);
  }
};

export const updateBridgeAction = () => async (dispatch, getState) => {
  try {
    const dataToSend =
    {
      "configuration": {
        "model": "gpt-3.5-turbo",
        "name": "bridge1",
        "service": "OpenAI",
        "temperature": 1,
        "prompt": [],
        "type": "chat"
      },
      "org_id": "124dfgh67ghj"
    }
    const data = await axios.post(`http://localhost:7072/api/v1/config/updatebridges/6ae25830-c74a-11ee-afda-7b5d9670126d`, dataToSend);
    dispatch(updateBridgeReducer(data.data.bridges));
  } catch (error) {
    console.error(error);
  }
};