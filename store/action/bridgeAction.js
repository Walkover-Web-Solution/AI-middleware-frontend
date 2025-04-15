import { addorRemoveResponseIdInBridge, archiveBridgeApi, createBridge, createBridgeVersionApi, createDuplicateBridge, createapi, deleteBridge, deleteFunctionApi, discardBridgeVersionApi, genrateSummary, getAllBridges, getAllFunctionsApi, getAllResponseTypesApi, getBridgeVersionApi, getChatBotOfBridge, getPrebuiltToolsApi, getSingleBridge, getTestcasesScrore, integration, publishBridgeVersionApi, updateBridge, updateBridgeVersionApi, updateFunctionApi, updateapi, uploadImage } from "@/config";
import { toast } from "react-toastify";
import { createBridgeReducer, createBridgeVersionReducer, deleteBridgeReducer, duplicateBridgeReducer, fetchAllBridgeReducer, fetchAllFunctionsReducer, fetchSingleBridgeReducer, fetchSingleBridgeVersionReducer, getPrebuiltToolsReducer, integrationReducer, isError, isPending, publishBrigeVersionReducer, removeFunctionDataReducer, updateBridgeReducer, updateBridgeToolsReducer, updateBridgeVersionReducer, updateFunctionReducer } from "../reducer/bridgeReducer";
import { getAllResponseTypeSuccess } from "../reducer/responseTypeReducer";

//   ---------------------------------------------------- ADMIN ROUTES ---------------------------------------- //
export const getSingleBridgesAction = ({ id, version }) => async (dispatch, getState) => {
  try {
    dispatch(isPending())
    const data = await getSingleBridge(id);
    dispatch(fetchSingleBridgeReducer({ bridge: data.data?.bridge }));
    getBridgeVersionAction({ versionId: version || data.data?.bridge?.published_version_id })(dispatch);
  } catch (error) {
    dispatch(isError())
    console.error(error);
  }
};

export const getBridgeVersionAction = ({ versionId }) => async (dispatch) => {
  try {
    dispatch(isPending())
    const data = await getBridgeVersionApi({ bridgeVersionId: versionId });
    dispatch(fetchSingleBridgeVersionReducer({ bridge: data?.bridge }));
  } catch (error) {
    dispatch(isError())
    console.error(error);
  }
};

export const createBridgeAction = (dataToSend, onSuccess) => async (dispatch, getState) => {
  try {
    const response = await createBridge(dataToSend.dataToSend);
    // Extract only the necessary serializable data from the response
    const serializableData = {
      data: response.data,
      status: response.status,
      statusText: response.statusText
    };
    onSuccess(serializableData);
    dispatch(createBridgeReducer({ data: serializableData, orgId: dataToSend.orgid }));
  } catch (error) {
    if (error?.response?.data?.message?.includes("duplicate key")) {
      toast.error("Bridge Name can't be duplicate");
    } else {
      toast.error("Something went wrong");
    }
    console.error(error);
    throw error;
  }
};

export const createBridgeVersionAction = (data, onSuccess) => async (dispatch, getState) => {
  try {
    const dataToSend = {
      version_id: data?.parentVersionId,
      version_description: data?.version_description
    }
    const result = await createBridgeVersionApi(dataToSend);
    if (result?.success) {
      onSuccess(result);
      dispatch(createBridgeVersionReducer({ newVersionId: result?.version_id, parentVersionId: data?.parentVersionId, bridgeId: data?.bridgeId, version_description: data?.version_description }));
      toast.success('New version created successfully');
    }
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
    const alerting_embed_token = response?.data?.alerting_embed_token;
    const history_page_chatbot_token = response?.data?.history_page_chatbot_token
    const triggerEmbedToken = response?.data?.trigger_embed_token;

    if (onSuccess) onSuccess(response?.data?.bridge?.length)
    dispatch(fetchAllBridgeReducer({ bridges: response?.data?.bridge, orgId: response?.data?.org_id, embed_token, alerting_embed_token, history_page_chatbot_token, triggerEmbedToken }));

    const integrationData = await integration(embed_token);
    const flowObject = integrationData?.flows?.reduce((obj, item) => {
      obj[item.id] = item;
      return obj;
    }, {});
    dispatch(fetchAllBridgeReducer({ orgId: response?.data?.org_id, integrationData: flowObject }));
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

export const updateFuntionApiAction = ({ function_id, dataToSend }) => async (dispatch) => {
  try {
    const response = await updateFunctionApi({ function_id, dataToSend });
    dispatch(updateFunctionReducer({ org_id: response.data.data.org_id, data: response.data.data }))
  } catch (error) {
    dispatch(isError())
    console.error(error);

  }
}

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
    return { success: true };
  } catch (error) {
    console.error(error);
    dispatch(isError());
  }
};

export const updateBridgeVersionAction = ({ versionId, dataToSend }) => async (dispatch) => {
  try {
    dispatch(isPending());
    const data = await updateBridgeVersionApi({ versionId, dataToSend });
    if (data.success) {
      dispatch(updateBridgeVersionReducer({ bridges: data.bridge, functionData: dataToSend?.functionData || null }));
    }
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
      return data?.data;
    }
  } catch (error) {
    console.error(error)
  }
}

export const updateApiAction = (bridge_id, dataFromEmbed) => async (dispatch) => {
  try {
    const data = await updateapi(bridge_id, dataFromEmbed);
    // dispatch(updateBridgeReducer({ bridges: data?.data?.bridge }));
    dispatch(updateBridgeVersionReducer({ bridges: data?.data?.bridge }));
  } catch (error) {
    console.error(error)
  }
}

export const publishBridgeVersionAction = ({ bridgeId, versionId, orgId }) => async (dispatch) => {
  try {
    const data = await publishBridgeVersionApi({ versionId });
    if (data?.success) {
      dispatch(publishBrigeVersionReducer({ versionId: data?.version_id, bridgeId, orgId }));
      toast.success('Bridge Version published successfully');
    }
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

export const archiveBridgeAction = (bridge_id, newStatus = 1) => async (dispatch) => {
  try {
    dispatch(isPending());
    const response = await archiveBridgeApi(bridge_id, newStatus);
    dispatch(updateBridgeReducer({ bridges: response.data, functionData: null }))
    return response?.data?.status;
  } catch (error) {
    dispatch(isError());
    toast.error('Failed to Archive the bridge');
    console.error("Failed to duplicate the bridge: ", error);
  }
}

export const dicardBridgeVersionAction = ({ bridgeId, versionId }) => async (dispatch) => {
  try {
    await discardBridgeVersionApi({ bridgeId, versionId });
  } catch (error) {
    console.error(error)
  }
}

export const uploadImageAction = (formData) => async (dispatch) => {
  try {
    const response = await uploadImage(formData);
    return response;
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

export const genrateSummaryAction = ({ bridgeId, versionId, orgId }) => async (dispatch) => {
  try {
    const response = await genrateSummary({ bridgeId, versionId, orgId });
    return response;
  } catch (error) {
    dispatch(isError());
    toast.error('Failed to update summary');
    console.error("Failed to update summary: ", error);
  }
}

export const getTestcasesScroreAction = (version_id) => async (dispatch) => {
  try {
    const reponse = await getTestcasesScrore(version_id);
    return reponse;
  } catch (error) {
    toast.error('Failed to genrate testcase score');
  }
}

export const deleteFunctionAction = ({function_name, functionId, orgId}) => async (dispatch) => {
  try {
    const reponse = await deleteFunctionApi(function_name);
    dispatch(removeFunctionDataReducer({orgId, functionId}))
    return reponse;
  } catch (error) {
    toast.error('Failed to delete function')
  }
}

export const getPrebuiltToolsAction = () => async (dispatch) => {
  try {
    const response = await getPrebuiltToolsApi();
    dispatch(getPrebuiltToolsReducer({ tools: response?.in_built_tools }));
  } catch (error) {
    console.error(error)
  }
}