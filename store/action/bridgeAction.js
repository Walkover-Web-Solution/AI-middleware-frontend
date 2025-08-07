import { addorRemoveResponseIdInBridge, archiveBridgeApi, createBridge, createBridgeVersionApi, createBridgeWithAiAPi, createDuplicateBridge, createapi, deleteBridge, deleteFunctionApi, discardBridgeVersionApi, genrateSummary, getAllBridges, getAllFunctionsApi, getAllResponseTypesApi, getBridgeVersionApi, getChatBotOfBridge, getPrebuiltToolsApi, getSingleBridge, getTestcasesScrore, integration, publishBridgeVersionApi, updateBridge, updateBridgeVersionApi, updateFunctionApi, updateapi, uploadImage } from "@/config";
import { toast } from "react-toastify";
import { backupBridgeVersionReducer, bridgeVersionRollBackReducer, createBridgeReducer, createBridgeVersionReducer, deleteBridgeReducer, duplicateBridgeReducer, fetchAllBridgeReducer, fetchAllFunctionsReducer, fetchSingleBridgeReducer, fetchSingleBridgeVersionReducer, getPrebuiltToolsReducer, integrationReducer, isError, isPending, publishBrigeVersionReducer, removeFunctionDataReducer, updateBridgeReducer, updateBridgeToolsReducer, updateBridgeVersionReducer, updateFunctionReducer } from "../reducer/bridgeReducer";
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
      toast.error("Agent Name can't be duplicate");
    } else {
      toast.error("Something went wrong");
    }
    console.error(error);
    throw error;
  }
};

export const createBridgeWithAiAction = ({ dataToSend, orgId }, onSuccess) => async (dispatch, getState) => {
  try {
    const data = await createBridge(dataToSend)
    dispatch(createBridgeReducer({ data, orgId: orgId }));
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
      toast.error("Agent Name can't be duplicate");
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
    const average_response_time = response?.data?.avg_response_time;
    const doctstar_embed_token=response?.data?.doctstar_embed_token;


    if (onSuccess) onSuccess(response?.data?.bridge?.length)
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
    // Create backup of the current bridge state
    dispatch(backupBridgeVersionReducer({ bridgeId }));
    
    // Optimistic update - must use updateBridgeReducer, not updateBridgeVersionReducer
    dispatch(updateBridgeReducer({
      bridges: {
        _id: bridgeId,
        ...dataToSend,
        configuration: dataToSend.configuration || {}
      },
      functionData: dataToSend?.functionData || null
    }));
    
    // Set loading state after optimistic update
    dispatch(isPending());
    
    // API call
    const data = await updateBridge({ bridgeId, dataToSend });
    
    // Update with actual response data
    dispatch(updateBridgeReducer({ bridges: data.data.bridge, functionData: dataToSend?.functionData || null }));
    return { success: true };
  } catch (error) {
    // Rollback on failure
    dispatch(bridgeVersionRollBackReducer({ bridgeId }));
    console.error(error);
    dispatch(isError());
    throw error;
  }
};

export const updateBridgeVersionAction = ({ versionId, dataToSend, bridgeId='' }) => async (dispatch) => {
  
  try {
  // Step 1: Create a backup of the current bridge version state
  dispatch(backupBridgeVersionReducer({
      bridgeId: bridgeId || dataToSend?.parent_id || dataToSend?.parentId, 
      versionId 
    }));
    
    // Step 2: First, optimistically update the UI immediately with a properly formatted payload
    // Make sure all required fields are present in the optimistic update
    const parentId = bridgeId || dataToSend?.parent_id || dataToSend?.parentId;
    
    const optimisticBridgeData = {
      ...dataToSend,
      _id: versionId,
      parent_id: parentId,
      // Ensure we have a valid configuration object
      configuration: dataToSend.configuration || {}
    };
    
    // Perform the optimistic update
    dispatch(updateBridgeVersionReducer({
      bridges: optimisticBridgeData,
      functionData: dataToSend?.functionData || null
    }));
    
    // Step 3: Now set loading state after the optimistic update
    // This way loading state doesn't interfere with optimistic changes
    dispatch(isPending());
    
    // Step 4: Make the actual API call
    const data = await updateBridgeVersionApi({ versionId, dataToSend });
    if (data?.success) {
      dispatch(updateBridgeVersionReducer({ bridges: data.bridge, functionData: dataToSend?.functionData || null }));
    }
  } catch (error) {
    // Step 6: If API call fails, roll back to previous state
    dispatch(bridgeVersionRollBackReducer({ 
      bridgeId: bridgeId || dataToSend?.parent_id || dataToSend?.parentId, 
      versionId 
    }));
    
    dispatch(isError());
    toast.error('Failed to update bridge version');
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
    dispatch(backupBridgeVersionReducer({ bridgeId: bridge_id, versionId: dataFromEmbed?.version_id }));
    dispatch(updateBridgeVersionReducer({ bridges: dataFromEmbed }));
    const data = await updateapi(bridge_id, dataFromEmbed);
    // dispatch(updateBridgeReducer({ bridges: data?.data?.bridge }));
    dispatch(updateBridgeVersionReducer({ bridges: data?.data?.bridge }));
  } catch (error) {
    console.error(error)
    dispatch(bridgeVersionRollBackReducer({ bridgeId: bridge_id, versionId: dataFromEmbed?.version_id }));
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

export const deleteFunctionAction = ({ function_name, functionId, orgId }) => async (dispatch) => {
  try {
    const reponse = await deleteFunctionApi(function_name);
    dispatch(removeFunctionDataReducer({ orgId, functionId }))
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