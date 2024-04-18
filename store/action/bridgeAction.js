import { createBridge, getAllBridges, getSingleBridge,deleteBridge, integration, createapi } from "@/api";
import { createBridgeReducer, fetchAllBridgeReducer, fetchSingleBridgeReducer, updateBridgeReducer,deleteBridgeReducer, integrationReducer } from "../reducer/bridgeReducer";
import axios from "@/utils/interceptor";


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
    console.error(error);
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


export const deleteBridgeAction = (bridgeId) => async (dispatch) => {
  try {
      await deleteBridge(bridgeId);
      dispatch(deleteBridgeReducer(bridgeId));
  } catch (error) {
      console.error('Failed to delete bridge:', error);
  }
};


export const integrationAction = (embed_token , bridge_id) => async (dispatch) => {
  try {
    const intregrationData = await integration(embed_token);
    dispatch(integrationReducer({intregration : intregrationData , id :  bridge_id} ))
  } catch (error) {
    console.error(error)
  }
}


export const createApiAction = (bridge_id , dataFromEmbed) => async () => {
  try {    
     await createapi(bridge_id , dataFromEmbed);
    
  } catch (error) {
    console.error(error)
  }
}
