"use client"

import axios from "@/utils/interceptor"
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;

export const runtime = 'edge';

export const getSingleModels = async () => {
  try {
    const getSingleModels = await axios.get(`${URL}/api/v1/config/models`)
    return getSingleModels
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const getSingleMessage = async ({ bridge_id, message_id }) => {
  try {
    const messageData = await axios.get(`${URL}/api/v1/config/systemprompt/gethistory/${bridge_id}/${message_id}`)
    return messageData.data.system_prompt
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const getSingleBridge = async (bridgeId) => {
  try {
    const response = await axios.get(`${URL}/api/v1/config/getbridges/${bridgeId}`)
    return response
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const deleteBridge = async (bridgeId) => {
  try {
    const response = await axios.delete(`${URL}/api/v1/config/deletebridges/${bridgeId}`);
    return response;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete the bridge");
    throw new Error(error);
  }
};



export const createBridge = async (dataToSend) => {
  try {
    return await axios.post(`${URL}/api/v1/config/createbridges`, dataToSend)
  } catch (error) {
    toast.error(error.response.data.error)
  }
}


export const getAllBridges = async () => {
  try {
    const data = await axios.get(`${URL}/api/v1/config/getbridges/all`)
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const getAllResponseTypesApi = async (orgId) => {
  try {
    const data = await axios.get(`${URL}/chatbot/${orgId}/getAllResponse`)
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}



export const updateBridge = async ({ bridgeId, dataToSend }) => {
  try {
    const response = await axios.post(`${URL}/api/v1/config/updatebridges/${bridgeId}`, dataToSend)
    // toast.success("Bridge is updated");
    return response
  } catch (error) {
    console.log(error)
    toast.error(error?.response?.data?.error);
  }
}



export const getSingleThreadData = async (threadId, bridgeId) => {
  try {
    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/threads/${threadId}/${bridgeId}`)
    return getSingleThreadData
  } catch (error) {
    console.error(error)
  }
}


export const getHistory = async (bridgeId) => {
  try {
    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/history/${bridgeId}`)
    return getSingleThreadData
  } catch (error) {
    console.error(error)
  }
}

export const dryRun = async ({ localDataToSend, bridge_id }) => {

  try {
    let dryRun
    if (localDataToSend.configuration.type === "chat") dryRun = await axios.post(`${URL}/api/v1/model/playground/chat/completion/${bridge_id}`, localDataToSend)
    if (localDataToSend.configuration.type === "completion") dryRun = await axios.post(`${URL}/api/v1/model/playground/completion/${bridge_id}`, localDataToSend)
    if (localDataToSend.configuration.type === "embedding") dryRun = await axios.post(`${URL}/api/v1/model/playground/embeddings/${bridge_id}`, localDataToSend)

    return { success: true, data: dryRun.data }
  } catch (error) {
    console.error("dry run error", error, error.response.data.error);
    return { success: false, error: error.response.data.error }
  }
}







// api keys api 

export const userdetails = async () => {
  try {
    const details = await axios.get(`${PROXY_URL}/api/c/getDetails`)
    return details
  }
  catch (error) {
    console.error(error)
  }
}

export const logout = async () => {
  try {
    await axois.delete(`${PROXY_URL}/{featureId}/deleteCCompany/{cCompanyId}`)

  } catch {
    console.error("problem in logout ")
  }
}

export const allAuthKey = async () => {
  try {

    const response = await axios(`${PROXY_URL}/api/c/authkey`)
    return response?.data?.data
  } catch (error) {
    console.error(error)
  }
}

export const logoutUserFromMsg91 = async (headers) => {
  const User = await axios.delete(`${PROXY_URL}/api/c/logout`, headers)
  return User
}

export const createAuthKey = async (dataToSend) => {
  try {
    return await axios.post(`${PROXY_URL}/api/c/authkey`, dataToSend)

  } catch (error) {
    console.error(error)
  }
}

export const deleteAuthkey = async (id) => {

  try {
    await axios.delete(`${PROXY_URL}/api/c/authkey/${id}`)
  } catch (error) {
    console.error(error)
  }
}

export const createOrg = async (dataToSend) => {
  try {
    const data = await axios.post(`${PROXY_URL}/api/c/createCompany`, dataToSend)
    return data;
  } catch (error) {
    toast.error(error.response.data.error)
  }
}

export const getAllOrg = async () => {
  try {
    const data = await axios.get(`${PROXY_URL}/api/c/getCompanies`)
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}


export const switchOrg = async (company_ref_id) => {
  try {
    const data = await axios.post(`${PROXY_URL}/api/c/switchCompany`, { company_ref_id });

    return data;
  } catch (error) {
    console.error(error);
    return error;
  }
};


export const inviteUser = async (email) => {
  try {
    const response = await axios.post(`${PROXY_URL}/api/c/addUser`, email)
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getInvitedUsers = async () => {
  try {
    const data = await axios.get(`${PROXY_URL}/api/c/getUsers`);
    return data;
  } catch (error) {
    console.error(error);
    return error;
  }
}


export const getMetricsData = async (org_id, startDate, endDate) => {
  try {
    const response = await axios.get(`${URL}/api/v1/metrics/${org_id}`, {
      params: {
        startTime: startDate,
        endTime: endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}


export const integration = async (embed_token) => {
  try {
    const response = await fetch("https://flow-api.viasocket.com/projects/projXzlaXL3n/integrations", {
      method: "GET",
      headers: {
        Authorization: embed_token
      }
    });
    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error(error)
    return error;
  }
}


export const createapi = async (bridge_id, dataFromEmbed) => {
  try {
    await axios.post(`${URL}/api/v1/config/createapi/${bridge_id}`, dataFromEmbed);
  } catch (error) {
    console.error(error);
    return error;
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


// routes.route('/:orgId/:botId/bridge/:bridgeId').put(addorRemoveBridgeInChatBot); // update chatbot actions

export const addorRemoveBridgeInChatBot = async (orgId, botId, bridgeId, type) => {
  try {
    const response = await axios.put(`${URL}/chatbot/${orgId}/${botId}/bridge/${bridgeId}?type=${type}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}


// routes.route('/:botId').put(updateChatBot); // update chatbot

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

export const loginUser = async (dataToSend) => {
  try {
    const response = await axios.post(`${URL}/user/localToken`, dataToSend);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const switchUser = async (dataToSend) => {
  try {
    const response = await axios.post(`${URL}/user/switchOrg`, dataToSend);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}