import axios from "@/utils/interceptor";
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Chatbot Management APIs
export const getAllChatBot = async (orgId) => {
  try {
    const response = await axios.get(`${URL}/chatbot/${orgId}/all`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const createChatBot = async (dataToSend) => {
  try {
    const response = await axios.post(`${URL}/chatbot/`, dataToSend);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getChatBotDetails = async (botId) => {
  try {
    const response = await axios.get(`${URL}/chatbot/${botId}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getChatBotOfBridge = async (orgId, bridgeId) => {
  try {
    const response = await axios.get(`${URL}/chatbot/${orgId}/${bridgeId}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const updateChatBot = async (botId, dataToSend) => {
  try {
    const response = await axios.put(`${URL}/chatbot/${botId}`, dataToSend);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const updateChatBotConfig = async (botId, dataToSend) => {
  try {
    const response = await axios.post(`${URL}/chatbot/${botId}/updateconfig`, dataToSend);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const addorRemoveBridgeInChatBot = async (orgId, botId, bridgeId, type) => {
  try {
    const response = await axios.put(`${URL}/chatbot/${orgId}/${botId}/bridge/${bridgeId}?type=${type}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// Chatbot Response Management APIs
export const getAllResponseTypesApi = async (orgId) => {
  try {
    const data = await axios.get(`${URL}/chatbot/${orgId}/getAllResponse`)
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const createReponseTypeInOrg = async (orgId) => {
  try {
    const data = await axios.post(`${URL}/chatbot/${orgId}/createResponse`)
    return data;
  } catch (error) {
    toast.error(error.response.data.error)
  }
}

export const createOrgToken = async (orgId) => {
  try {
    const data = await axios.post(`${URL}/chatbot/${orgId}/createtoken`)
    return data;
  } catch (error) {
    toast.error(error.response.data.error)
  }
}

export const addorRemoveResponseIdInBridge = async (bridge_id, orgId, responseObj) => {
  try {
    const response = await axios.post(`${URL}/chatbot/${orgId}/addresponseid/bridge/${bridge_id}`, { ...responseObj });
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// Chatbot Action Management APIs
export const createOrRemoveAction = async ({ orgId, bridgeId, versionId, type, dataToSend }) => {
  try {
    const response = await axios.post(`${URL}/chatbot/${orgId}/bridge/${bridgeId}/action?type=${type}`, { ...dataToSend, version_id: versionId });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}
