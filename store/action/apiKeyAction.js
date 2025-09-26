import { deleteApikey, getAllApikey, saveApiKeys, updateApikey } from "@/config";
import { apikeyDataReducer, apikeyDeleteReducer, apikeyRollBackReducer, apikeyUpdateReducer, backupApiKeysReducer, createApiKeyReducer } from "../reducer/bridgeReducer";
import { toast } from "react-toastify";


export const saveApiKeysAction = (data, orgId) => async (dispatch) => {
  try {
    const response = await saveApiKeys(data);
    if (response.data?.success) {
      dispatch(createApiKeyReducer({ org_id: orgId, data: response?.data?.api }))
    }
    return response.data.api;
  } catch (error) {
    console.error(error);
  }
};

export const updateApikeyAction = (dataToSend) => async (dispatch) => {
  // Step 1: Create a backup of the current state
  dispatch(backupApiKeysReducer({ org_id: dataToSend.org_id }));
  
  // Step 2: Perform optimistic update in the UI
  dispatch(apikeyUpdateReducer({ 
    org_id: dataToSend.org_id, 
    id: dataToSend.apikey_object_id, 
    name: dataToSend.name, 
    data: dataToSend.apikey, 
    comment: dataToSend.comment,
    apikey_quota: dataToSend.apikey_quota 
  }));
  
  try {
    // Step 3: Make the actual API call
    const response = await updateApikey(dataToSend);
    if (response.data?.success) {
      dispatch(apikeyUpdateReducer({ 
        org_id: dataToSend.org_id, 
        id: dataToSend.apikey_object_id, 
        name: dataToSend.name, 
        data: response.data.apikey, 
        comment: dataToSend.comment,
        apikey_quota: dataToSend.apikey_quota 
      }));
    }
    else{
      toast.error('Failed to update API key');
      dispatch(apikeyRollBackReducer({ org_id: dataToSend.org_id }));
    }
  } catch (error) {
    // API call failed with exception
    toast.error(error?.message || 'Error updating API key');
    console.error(error);
    // Roll back to the original state
    dispatch(apikeyRollBackReducer({ org_id: dataToSend.org_id }));
  }
}

export const deleteApikeyAction = ({ org_id, name, id }) => async (dispatch, getState) => {
  // Step 1: Create a backup of the current state
  dispatch(backupApiKeysReducer({ org_id })); 
  // Step 2: Optimistically delete from UI immediately
  dispatch(apikeyDeleteReducer({ org_id, name })); 
  try {
    // Step 3: Make the API call in the background
    const response = await deleteApikey(id);
    if (response.data?.success) {
      dispatch(apikeyDeleteReducer({ org_id, name }));
    }
    else{
      toast.error('Failed to delete API key');
      dispatch(apikeyRollBackReducer({ org_id }));
    }
  } catch (error) {
    // API call failed with exception
    toast.error(error?.message || 'Error deleting API key');
    console.error(error);
    // Roll back to original state
    dispatch(apikeyRollBackReducer({ org_id }));
  }
}

export const getAllApikeyAction = (org_id) => async (dispatch) => {

  try {
    const response = await getAllApikey({ org_id: org_id });
    if (response.data.success)
      dispatch(apikeyDataReducer({ org_id, data: response.data.result }))
  } catch (error) {
    console.error(error)
    toast.error(error);
  }
}
