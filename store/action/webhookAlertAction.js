import { createWebhookAlert, deleteWebhookAlert, getAllWebhookAlert, updateWebhookAlert } from "@/config";
import { toast } from "react-toastify";
import { createWebhookAlertReducer, deleteWebhookAlertReducer, updateWebhookAlertReducer, webhookDataReducer } from "../reducer/webhookAlertReducer";


export const createWebhookAlertAction = (dataToSend) => async (dispatch) => {
  try {
    const response = await createWebhookAlert(dataToSend);
    if (response.success)
      dispatch(createWebhookAlertReducer(response.data));
  } catch (error) {
    toast.error(error)
    console.error(error);
  }
};


export const updateWebhookAlertAction = ({ data, id }) => async (dispatch) => {
  try {
    const response = await updateWebhookAlert({ data, id });
    dispatch(updateWebhookAlertReducer(response.data));
  } catch (error) {
    toast.error(error)
    console.error(error);
  }
};


export const deleteWebhookAlertAction = (id) => async (dispatch) => {
  try {
    const response = await deleteWebhookAlert(id);
    dispatch(deleteWebhookAlertReducer({ id }));
  } catch (error) {
    toast.error(error)
    console.error(error);
  }
};


export const getAllWebhookAlertAction = (org_id) => async (dispatch) => {
  try {
    const response = await getAllWebhookAlert(org_id);
    dispatch(webhookDataReducer({ data: response.data }));
  } catch (error) {
    toast.error(error)
    console.error(error);
  }
};