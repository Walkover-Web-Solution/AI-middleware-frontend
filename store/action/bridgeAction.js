import { createBridge, getAllBridges, getSingleBridge, deleteBridge, integration, createapi, updateBridge, getAllResponseTypesApi } from "@/api";
import { createBridgeReducer, fetchAllBridgeReducer, fetchSingleBridgeReducer, updateBridgeReducer, deleteBridgeReducer, integrationReducer, isPending, isError } from "../reducer/bridgeReducer";
import { getAllResponseTypeSuccess } from "../reducer/responseTypeReducer";


//   ---------------------------------------------------- ADMIN ROUTES ---------------------------------------- //
export const getSingleBridgesAction = (id) => async (dispatch, getState) => {
  try {
    dispatch(isPending())
    const data = await getSingleBridge(id);
    const integrationData = await integration(data.data.bridges.embed_token)
    dispatch(fetchSingleBridgeReducer({ bridges: data.data.bridges, integrationData }));
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
  }
};

export const getAllBridgesAction = (orgId) => async (dispatch, getState) => {
  try {
    dispatch(isPending())
    const response = await getAllBridges();
    dispatch(fetchAllBridgeReducer({ bridges: response.data.bridges, orgId }));
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

export const updateBridgeAction = (dataToSend) => async (dispatch, getState) => {
  try {
    const data = await updateBridge(dataToSend)
    dispatch(updateBridgeReducer(data.data));
  } catch (error) {
    console.error(error);
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


export const integrationAction = (embed_token, bridge_id) => async (dispatch) => {
  try {
    const intregrationData = await integration(embed_token);
    dispatch(integrationReducer({ intregration: intregrationData, id: bridge_id }))
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
