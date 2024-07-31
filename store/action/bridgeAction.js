import { addorRemoveResponseIdInBridge, createBridge, createDuplicateBridge, createapi, deleteBridge, getAllBridges, getAllResponseTypesApi, getChatBotOfBridge, getSingleBridge, integration, updateBridge } from "@/config";
import { createBridgeReducer, deleteBridgeReducer, duplicateBridgeReducer, fetchAllBridgeReducer, fetchSingleBridgeReducer, integrationReducer, isError, isPending, updateBridgeReducer } from "../reducer/bridgeReducer";
import { getAllResponseTypeSuccess } from "../reducer/responseTypeReducer";
import { toast } from "react-toastify";

//   ---------------------------------------------------- ADMIN ROUTES ---------------------------------------- //
export const getSingleBridgesAction = (id) => async (dispatch, getState) => {
  try {
    dispatch(isPending())
    const data = await getSingleBridge(id);
    const integrationData = await integration(data.data.bridges.embed_token)

    const flowObject = integrationData.flows.reduce((obj, item) => {
      obj[item.id] = item;
      return obj;
    }, {});

    const dataToSend = {
      "configuration": {
       "model": "gpt-4o",
       "name": "sample-1",
       "type": "chat",
       "prompt": "hi how are you",
       "tools": [
        {
         "type": "function",
         "name": "scrilsgNUg9q",
         "description": "QWSDAXZDQWSXDWQSA",
         "properties": {},
         "required": []
        }
       ],
       "creativity_level": {
        "value": 1,
        "min": 0,
        "max": 2,
        "step": 0.01,
        "default": 0
       },
       "probability_cutoff": {
        "value": 0.9,
        "min": 0,
        "max": 1,
        "step": 0.01,
        "default": 0.5
       },
       "repetition_penalty": {
        "value": 1.21,
        "min": 1,
        "max": 2,
        "step": 0.01,
        "default": 1
       },
       "novelty_penalty": {
        "value": 0.89,
        "min": 0,
        "max": 1,
        "step": 0.01,
        "default": 0.5
       },
       "log_probability": true,
       "json_mode": true,
       "response_count": 121,
       "response_format": {
        "type": "RTLayer / webhook / default",
        "cred": {
         "url": "https://google.com",
         "headers": [],
         "apikey": ""
        }
       },
       "stop_sequences": "4rfnmn",
       "token_selection_limit": {
        "value": 23,
        "min": 1,
        "max": 100,
        "step": 1,
        "default": 50
       },
       "topP": {
        "value": 0.3,
        "min": 0,
        "max": 1,
        "step": 0.01,
        "default": 0.9
       },
       "input_text": "ycfgdcvhjkghvb",
       "echo_input": true,
       "best_of": {
        "value": 14,
        "min": 1,
        "max": 20,
        "step": 1,
        "default": 1
       },
       "seed": 1,
       "response_suffix": "qdwas"
      },
      "apikey": "3dfc18ed8d9d5fbfb0f760ea2ba2c51c",  // same
      "slugName": "sadas",  // same
      "created_at": {
       "$date": "2024-07-15T09:33:24.150Z"
      },
      "actions": {
       "Vnl3zfTjGLZP": {
        "description": "asdsads",
        "type": "sendDataToFrontend",
        "variable": "sad"
       }
      },
      "org_id": "6730",  // same
      "name": "sample-1",  // same
      "bridgeType": "api",  // same
      "service": "openai",  // same
      "_id": "66a1e9316c4eeb9c621baf57"
     }
    dispatch(fetchSingleBridgeReducer({ bridges: dataToSend, integrationData: flowObject }));
  } catch (error) {
    dispatch(isError())
    console.error(error);
  }
};

export const createBridgeAction = (dataToSend, onSuccess) => async (dispatch, getState) => {
  try {
    const data = await createBridge(dataToSend.dataToSend);
    onSuccess(data);
    dispatch(createBridgeReducer({ data, orgId: dataToSend.orgid }));
  } catch (error) {
    console.error(error);
    throw error
  }
};

export const getAllBridgesAction = (onSuccess) => async (dispatch) => {
  try {
    dispatch(isPending())
    const response = await getAllBridges();
    onSuccess(response?.data?.bridges?.length)
    dispatch(fetchAllBridgeReducer({ bridges: response?.data?.bridges, orgId: response?.data?.org_id }));
  } catch (error) {
    dispatch(isError())
    console.error(error);
  }
};

export const getAllResponseTypesAction = (orgId) => async (dispatch, getState) => {
  try {
    dispatch(isPending())
    const response = await getAllResponseTypesApi(orgId);
    dispatch(getAllResponseTypeSuccess({ responseTypes: response.data.chatBot?.responseTypes, orgId: response.data?.chatBot?.orgId }));
  } catch (error) {
    dispatch(isError())
    console.error(error);
  }
};

export const updateBridgeAction = ({ bridgeId, dataToSend }) => async (dispatch) => {
  try {
    dispatch(isPending());
    const data = await updateBridge({ bridgeId, dataToSend });
    // dispatch(updateBridgeReducer({ bridges: data.data.bridges, bridgeType: dataToSend.bridgeType }));
  } catch (error) {
    console.error(error);
    dispatch(isError());
  }
};



export const deleteBridgeAction = ({ bridgeId, orgId }) => async (dispatch) => {
  try {
    await deleteBridge(bridgeId);
    dispatch(deleteBridgeReducer({ bridgeId, orgId }));
  } catch (error) {
    console.error('Failed to delete bridge:', error);
  }
};


export const integrationAction = (dataToSend, bridge_id) => async (dispatch) => {
  try {
    dispatch(integrationReducer({ dataToSend, id: bridge_id }))
  } catch (error) {
    console.error(error)
  }
}


export const createApiAction = (bridge_id, dataFromEmbed) => async () => {
  try {
    await createapi(bridge_id, dataFromEmbed);

  } catch (error) {
    console.error(error)
  }
}


export const addorRemoveResponseIdInBridgeAction = (bridge_id, org_id, responseObj) => async (dispatch) => {
  try {

    const response = await addorRemoveResponseIdInBridge(bridge_id, org_id, responseObj);
    dispatch(updateBridgeReducer(response.data))
  } catch (error) {
    console.error(error)
  }
}

export const getChatBotOfBridgeAction = (orgId, bridgeId) => async (dispatch) => {
  try {
    const response = await getChatBotOfBridge(orgId, bridgeId);
    dispatch(updateBridgeReducer(response.data))
  } catch (error) {
    console.error(error)
  }
}

export const duplicateBridgeAction = (bridge_id) => async (dispatch) => {
  try {
    dispatch(isPending());
    const response = await createDuplicateBridge(bridge_id);
    dispatch(duplicateBridgeReducer(response));
    return response?.result?.['_id'];
  } catch (error) {
    dispatch(isError());
    toast.error('Failed to duplicate the bridge');
    console.error("Failed to duplicate the bridge: ", error);
  }
}
