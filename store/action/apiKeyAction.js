import { deleteApikey, getAllApikey, saveApiKeys, updateApikey } from "@/config";
import { apikeyDataReducer, apikeyDeleteReducer, apikeyUpdateReducer, createApiKeyReducer } from "../reducer/bridgeReducer";
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
  try {
    const response = await updateApikey(dataToSend);
    if (response.data.success)
      dispatch(apikeyUpdateReducer({ org_id: dataToSend.org_id, name: dataToSend.name, id: dataToSend.apikey_object_id, data: response.data.apikey, comment: dataToSend.comment }))

  } catch (error) {
    toast.error(error);
    console.error(error);
  }
}
export const deleteApikeyAction = ({ org_id, name, id }) => async (dispatch) => {
  try {
    const response = await deleteApikey(id);
    if (response.data.success)
      dispatch(apikeyDeleteReducer({ org_id, name }))

  } catch (error) {
    toast.error(error);
    console.error(error);
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
