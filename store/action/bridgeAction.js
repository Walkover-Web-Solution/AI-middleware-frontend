import { addorRemoveResponseIdInBridge, archiveBridgeApi, createBridge, createBridgeVersionApi, createDuplicateBridge, createapi, deleteBridge, deleteBridgeVersionApi, deleteFunctionApi, discardBridgeVersionApi, genrateSummary, getAllBridges, getAllFunctionsApi, getAllResponseTypesApi, getBridgeVersionApi, getChatBotOfBridge, getPrebuiltToolsApi, getSingleBridge, getTestcasesScrore, integration, publishBridgeVersionApi, publishBulkVersionApi, updateBridge, updateBridgeVersionApi, updateFunctionApi, updateapi, uploadImage } from "@/config";
import { toast } from "react-toastify";
import { clearPreviousBridgeDataReducer, createBridgeReducer, createBridgeVersionReducer, deleteBridgeReducer, deleteBridgeVersionReducer, duplicateBridgeReducer, fetchAllBridgeReducer, fetchAllFunctionsReducer, fetchSingleBridgeReducer, fetchSingleBridgeVersionReducer, getPrebuiltToolsReducer, integrationReducer, isError, isPending, publishBrigeVersionReducer, removeFunctionDataReducer, updateBridgeReducer, updateBridgeToolsReducer, updateBridgeVersionReducer, updateFunctionReducer } from "../reducer/bridgeReducer";
import { getAllResponseTypeSuccess } from "../reducer/responseTypeReducer";
import { markUpdateInitiatedByCurrentTab } from "@/utils/utility";
//   ---------------------------------------------------- ADMIN ROUTES ---------------------------------------- //
export const getSingleBridgesAction = ({ id, version }) => async (dispatch) => {
  try {
    dispatch(clearPreviousBridgeDataReducer())
    dispatch(isPending())
    const data = await getSingleBridge(id);
    dispatch(fetchSingleBridgeReducer({ bridge: data.data?.bridge }));
    getBridgeVersionAction({ versionId: version || data.data?.bridge?.published_version_id })(dispatch);
  } catch (error) {
    dispatch(isError())
    console.error(error);
    throw error.response;
  }
};

export const getBridgeVersionAction = ({ versionId }) => async (dispatch) => {
  try {
    dispatch(isPending())
    const data = await getBridgeVersionApi({ bridgeVersionId: versionId });
    dispatch(fetchSingleBridgeVersionReducer({ bridge: data?.bridge }));
    return data?.bridge;
  } catch (error) {
    dispatch(isError())
    console.error(error);
  }
};

export const createBridgeAction = (dataToSend, onSuccess) => async (dispatch) => {
  try {
    dispatch(clearPreviousBridgeDataReducer())
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
      toast.error("Agent Name can't be duplicate");
    } else {
      toast.error("Something went wrong");
    }
    console.error(error);
    throw error;
  }
};

export const createBridgeWithAiAction = ({ dataToSend, orgId }) => async (dispatch) => {
  try {
    dispatch(clearPreviousBridgeDataReducer())
    const data = await createBridge(dataToSend)
    dispatch(createBridgeReducer({data, orgId: orgId}));
    return data;
  } catch (error) {
    if (error?.response?.data?.message?.includes("duplicate key")) {
      toast.error("Agent Name can't be duplicate");
    } else {
      toast.error("Something went wrong");
    }
    console.error(error);
    throw error
  }
};

export const createBridgeVersionAction = (data, onSuccess) => async (dispatch) => {
  try {
    const dataToSend = {
      version_id: data?.parentVersionId,
      version_description: data?.version_description
    }
    const result = await createBridgeVersionApi(dataToSend);
    if (result?.success) {
      onSuccess(result);
      dispatch(createBridgeVersionReducer({ newVersionId: result?.version_id, parentVersionId: data?.parentVersionId, bridgeId: data?.bridgeId, version_description: data?.version_description, orgId: data?.orgId }));
      toast.success('New version created successfully');
    }
  } catch (error) {
    if (error?.response?.data?.message?.includes("duplicate key")) {
      toast.error("Agent Name can't be duplicate");
    } else {
      toast.error("Something went wrong");
    }
    console.error(error);
    throw error
  }
};

export const deleteBridgeVersionAction = ({ versionId, bridgeId, org_id }) => async (dispatch) => {
  try {
    const response = await deleteBridgeVersionApi({ versionId });
    dispatch(deleteBridgeVersionReducer({ versionId, bridgeId, org_id }));
    toast.success("Version Deleted Successfully")
    return response;
  } catch (error) {
    toast.error(error?.response?.data?.detail || "Error While Deleting Version")
    console.error(error?.response?.data?.detail);
    throw error;
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
    const average_response_time = response?.data?.avg_response_time;
    const doctstar_embed_token=response?.data?.doctstar_embed_token;


    if (onSuccess) onSuccess(response?.data?.bridge)
    dispatch(fetchAllBridgeReducer({ bridges: response?.data?.bridge, orgId: response?.data?.org_id, embed_token,doctstar_embed_token, alerting_embed_token, history_page_chatbot_token, triggerEmbedToken, average_response_time }));

    const integrationData = await integration(embed_token);
    const flowObject = integrationData?.flows?.reduce((obj, item) => {
      obj[item.id] = item;
      return obj;
    }, {});
    dispatch(fetchAllBridgeReducer({ orgId: response?.data?.org_id, integrationData: flowObject }));

    const triggerData = await integration(triggerEmbedToken);
    dispatch(fetchAllBridgeReducer({ orgId: response?.data?.org_id, triggerData: triggerData?.flows || [] }));
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

export const getAllResponseTypesAction = (orgId) => async (dispatch) => {
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
    markUpdateInitiatedByCurrentTab(bridgeId);
    const data = await updateBridge({ bridgeId, dataToSend });
    dispatch(updateBridgeReducer({ bridges: data.data.bridge, functionData: dataToSend?.functionData || null }));
    return { success: true };
  } catch (error) {
    console.error(error);
    dispatch(isError());
    throw error;
  }
};

export const updateBridgeVersionAction = ({ versionId, dataToSend }) => async (dispatch) => {
  try {
    if(!versionId){
      toast.error("You cannot update published data");
      return;
    }
    dispatch(isPending());
    markUpdateInitiatedByCurrentTab(versionId);
    const data = await updateBridgeVersionApi({ versionId, dataToSend });
    if (data?.success) {
      dispatch(updateBridgeVersionReducer({ bridges: data.bridge, functionData: dataToSend?.functionData || null }));
    }
  } catch (error) {
    console.error(error);
    dispatch(isError());
  }
};

export const deleteBridgeAction = ({ bridgeId, org_id, restore = false }) => async (dispatch) => {
  try {
    const response = await deleteBridge(bridgeId, org_id, restore);
    if (response?.data?.success) {
      dispatch(deleteBridgeReducer({ bridgeId, orgId: org_id, restore }));
    }
    return response;
  } catch (error) {
    toast.error(error?.response?.data?.error || error?.message || error || 'Failed to delete agent');
    console.error('Failed to delete bridge:', error);
    throw  error;
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
    markUpdateInitiatedByCurrentTab(dataFromEmbed?.version_id);
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
      toast.success('Agent Version published successfully');
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

export const dicardBridgeVersionAction = ({ bridgeId, versionId }) => async () => {
  try {
    await discardBridgeVersionApi({ bridgeId, versionId });
  } catch (error) {
    console.error(error)
  }
}

export const uploadImageAction = (formData, isVedioOrPdf) => async () => {
  try {
    const response = await uploadImage(formData, isVedioOrPdf);
    return response;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export const genrateSummaryAction = ({ bridgeId, versionId, orgId }) => async (dispatch) => {
  try {
    const response = await genrateSummary({ bridgeId, versionId, orgId });
    return response;
  } catch (error) {
    dispatch(isError());
    console.error("Failed to update summary: ", error);
  }
}

export const getTestcasesScroreAction = (version_id) => async () => {
  try {
    const reponse = await getTestcasesScrore(version_id);
    return reponse;
  } catch {
    toast.error('Failed to genrate testcase score');
  }
}

export const deleteFunctionAction = ({ function_name, functionId, orgId }) => async (dispatch) => {
  try {
    const reponse = await deleteFunctionApi(function_name);
    dispatch(removeFunctionDataReducer({ orgId, functionId }))
    return reponse;
  } catch {
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

export const publishBulkVersionAction = (version_ids) => async () => {
  try {
    const response = await publishBulkVersionApi(version_ids);
    return response;
  } catch (error) {
    toast.error('Failed to publish bulk version');
    throw error;
  }
}
