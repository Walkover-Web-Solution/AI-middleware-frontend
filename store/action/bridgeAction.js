import { addorRemoveResponseIdInBridge, createBridge, createDuplicateBridge, createapi, deleteBridge, getAllBridges, getAllFunctionsApi, getAllResponseTypesApi, getChatBotOfBridge, getSingleBridge, integration, updateBridge, updateapi } from "@/config";
import { createBridgeReducer, deleteBridgeReducer, duplicateBridgeReducer, fetchAllBridgeReducer, fetchAllFunctionsReducer, fetchSingleBridgeReducer, integrationReducer, isError, isPending, updateBridgeReducer, updateBridgeToolsReducer } from "../reducer/bridgeReducer";
import { getAllResponseTypeSuccess } from "../reducer/responseTypeReducer";
import { toast } from "react-toastify";

//   ---------------------------------------------------- ADMIN ROUTES ---------------------------------------- //
export const getSingleBridgesAction = (id) => async (dispatch, getState) => {
  try {
    dispatch(isPending())
    const data = await getSingleBridge(id);
    dispatch(fetchSingleBridgeReducer({ bridge: data.data?.bridge }));
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
    if (error?.response?.data?.message?.includes("duplicate key")) {
      toast.error("Bridge Name can't be duplicate");
    } else {
      toast.error("Something went wrong");
    }
    console.error(error);
    throw error
  }
};

export const getAllBridgesAction = (onSuccess) => async (dispatch) => {
  try {
    dispatch(isPending())
    const response = await getAllBridges();
    const embed_token = response?.data?.embed_token;
    const integrationData = await integration(embed_token);
    const flowObject = integrationData.flows.reduce((obj, item) => {
      obj[item.id] = item;
      return obj;
    }, {});
    if(onSuccess) onSuccess(response?.data?.bridge?.length)
    dispatch(fetchAllBridgeReducer({ bridges: response?.data?.bridge, orgId: response?.data?.org_id, integrationData: flowObject, embed_token }));
  } catch (error) {
    dispatch(isError())
    console.error(error);
  }
};

export const getAllFunctions = () => async (dispatch) => {
  try {
    dispatch(isPending())
    const response = await getAllFunctionsApi();
    const functionsArray = response.data?.data || [];
    const functionsObject = functionsArray.reduce((obj, item) => {
      obj[item._id] = item;
      return obj;
    }, {});
    dispatch(fetchAllFunctionsReducer({ orgId: response?.data?.org_id, functionData: functionsObject }));
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
    dispatch(updateBridgeReducer({ bridges: data.data.bridge, functionData: dataToSend?.functionData || null }));
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


export const integrationAction = (dataToSend, org_id) => async (dispatch) => {
  try {
    dispatch(integrationReducer({ dataToSend, orgId: org_id }))
  } catch (error) {
    console.error(error)
  }
}


export const createApiAction = (org_id, dataFromEmbed) => async (dispatch) => {
  try {
    const data = await createapi(dataFromEmbed);
    if (data?.success) {
      dispatch(updateBridgeToolsReducer({ orgId: org_id, functionData: data?.data }));
    }
  } catch (error) {
    console.error(error)
  }
}

export const updateApiAction = (bridge_id, dataFromEmbed) => async (dispatch) => {
  try {
    const data = await updateapi(bridge_id, dataFromEmbed);
    dispatch(updateBridgeReducer({ bridges: data?.data?.bridge }));
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
