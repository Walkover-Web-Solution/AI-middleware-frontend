import { createBridge, getAllBridges, getSingleBridge } from "@/api";
import { createBridgeReducer, fetchAllBridgeReducer, fetchSingleBridgeReducer, updateBridgeReducer } from "../reducer/bridgeReducer";
import axios from "@/utils/interceptor";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

//   ---------------------------------------------------- ADMIN ROUTES ---------------------------------------- //
export const getSingleBridgesAction = (id) => async (dispatch, getState) => {
  try {
    const data = await getSingleBridge(id);
    dispatch(fetchSingleBridgeReducer(data.data));
  } catch (error) {
    console.error(error);
  }
};

export const createBridgeAction = (dataToSend, onSuccess) => async (dispatch, getState) => {
  try {
    const data = await createBridge(dataToSend);
    onSuccess(data);
    dispatch(createBridgeReducer(data));
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // If the error is due to a bad request (status code 400),
      // parse the error message from the response body
      const errorMessage = error.response.data.message; // Adjust the property name as per your API response structure
      toast.error(errorMessage);
    } else {
      // For other types of errors (e.g., network errors), log the error
      console.error(error);
      toast.error("User Name Already exist , Try a unique name");
    }
  }
};

export const getAllBridgesAction = () => async (dispatch, getState) => {
  try {
    const response = await getAllBridges();
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