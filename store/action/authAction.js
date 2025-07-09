import { createNewAuth, getAuthData } from "@/config";
import { fetchAllAuthData } from "../reducer/authkeyReducer";
import { toast } from "react-toastify";
import { addAuth } from "../reducer/authReducer";

export const getAuthDataAction = (orgId) => async (dispatch) => {
  try {
    const response = await getAuthData();
    if (response.data) {
      dispatch(fetchAllAuthData({ 
        orgId,
        data : response?.data?.result,
      }))
    }
  } catch (error) {
    console.error(error);
  }
};
export const createAuth = (data, orgId) => async (dispatch) => {
  try {
    const response = await createNewAuth(data);
    if (response.data) {
      dispatch(addAuth({ 
        orgId,
        data : response?.data?.result,
      }))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};





