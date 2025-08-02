
import { getAllAgentsApi, privateAgentLoginApi, publicAgentLoginApi } from "@/config";
import { toast } from "react-toastify";
import { getAllAgentReducer, getPrivateAgentDataReducer, getPublicAgentDataReducer } from "../reducer/gwtyAgentReducer";

export const getAllAgentAction = () => async (dispatch) => {
  try {
    const response = await getAllAgentsApi();
    if (response) {
      dispatch(getAllAgentReducer({ data: response?.data}))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};

export const publicAgentLoginAction = () => async (dispatch) => {
  const user_id = localStorage.getItem('publicAgentUserId')
  try {
    const response = await publicAgentLoginApi(user_id != "undefined" &&  user_id ? user_id : {});
    localStorage.setItem('AgentToken', response?.data?.token)
    localStorage.setItem('publicAgentUserId',response?.data?.user_id)
    if (response) {
        dispatch(getPublicAgentDataReducer({ data: response?.data}))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};

export const privateAgentLoginAction = () => async (dispatch) => {
  const user_id = localStorage.getItem('privateAgentUserId')
  try {
    const response = await privateAgentLoginApi(user_id != "undefined" &&  user_id ? user_id : {});
    localStorage.setItem('AgentToken', response?.data?.token)
    localStorage.setItem('privateAgentUserId',response?.data?.user_id)
    if (response) {
        dispatch(getPrivateAgentDataReducer({ data: response?.data}))
    }
  } catch (error) {
    toast.error('Something went wrong');
    console.error(error);
  }
};


