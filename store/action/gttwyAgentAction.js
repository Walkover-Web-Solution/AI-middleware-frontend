
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
  try {
    const response = await publicAgentLoginApi();
    localStorage.setItem('AgentToken', response?.data?.token)
    localStorage.setItem('AgentUserId',response?.data?.userid)
    if (response) {
        dispatch(getPublicAgentDataReducer({ data: response?.data}))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};

export const privateAgentLoginAction = () => async (dispatch) => {
  try {
    const response = await privateAgentLoginApi();
    localStorage.setItem('AgentToken', response?.data?.token)
    localStorage.setItem('AgentUserId',response?.data?.userid)
    if (response) {
        dispatch(getPrivateAgentDataReducer({ data: response?.data}))
    }
  } catch (error) {
    toast.error('Something went wrong');
    console.error(error);
  }
};


