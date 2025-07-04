import { createIntegrationApi, getAllIntegrationApi } from "@/config";
import { toast } from "react-toastify";
import { addIntegrationDataReducer, fetchAllIntegrationData } from "../reducer/integrationReducer";


export const createIntegrationAction = (data) => async (dispatch) => {
  try {
    const response = await createIntegrationApi(data?.name);
    if (response.data) {
      dispatch(addIntegrationDataReducer({
        orgId: data?.orgId,
        data: response?.data,
        _id: response?.data?._id
      }))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};

export const getAllIntegrationDataAction = (orgId) => async (dispatch) => {
  try {
    const response = await getAllIntegrationApi();
    if (response.data) {
      dispatch(fetchAllIntegrationData({ data: response?.data, orgId, gtwyAccessToken: response?.gtwyAccessToken }))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};




