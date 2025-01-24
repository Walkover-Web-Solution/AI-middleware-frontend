"use client"

import axios from "@/utils/interceptor";
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;
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
    const response = await axios.get(`${PYTHON_URL}/api/v1/config/getbridges/${bridgeId}`)
    return response
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const getBridgeVersionApi = async ({ bridgeVersionId = null }) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/bridge/versions/get/${bridgeVersionId}`)
    return response?.data;
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
    return await axios.post(`${PYTHON_URL}/api/v1/config/create_bridge`, dataToSend)
  } catch (error) {
    toast.error(error.response.data.error)
    throw error
  }
}
export const createBridgeVersionApi = async (dataToSend) => {
  try {
    const result = await axios.post(`${PYTHON_URL}/bridge/versions/create`, dataToSend)
    return result?.data;
  } catch (error) {
    toast.error(error.response.data.error)
    throw error
  }
}


export const getAllBridges = async (org_id) => {
  try {
    const data = await axios.get(`${PYTHON_URL}/api/v1/config/getbridges/all`, org_id)
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const getAllFunctionsApi = async (org_id) => {
  try {
    const data = await axios.get(`${PYTHON_URL}/functions/all`, org_id)
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
    const response = await axios.post(`${PYTHON_URL}/api/v1/config/update_bridge/${bridgeId}`, dataToSend);
    return response
  } catch (error) {
    console.error(error)
    toast.error(error?.response?.data?.error);
  }
}

export const updateBridgeVersionApi = async ({ versionId, dataToSend }) => {
  try {
    const response = await axios.put(`${PYTHON_URL}/bridge/versions/update/${versionId}`, dataToSend);
    return response?.data
  } catch (error) {
    console.error(error)
    toast.error(error?.response?.data?.error);
  }
}

export const getSingleThreadData = async (threadId, bridgeId, subThreadId, nextPage, user_feedback, pagelimit = 40) => {
  try {
    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/threads/${threadId}/${bridgeId}?sub_thread_id=${subThreadId || threadId}&pageNo=${nextPage}&limit=${pagelimit}`, {
      params: {
        user_feedback
      }
    })
    return getSingleThreadData
  } catch (error) {
    console.error(error)
  }
}


export const getHistory = async (bridgeId, page = 1, start, end, keyword = '', user_feedback) => {
  try {

    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/history/${bridgeId}`, {
      params: {
        pageNo: page,
        limit: 40,
        startTime: start,
        endTime: end,
        keyword_search: keyword,
        user_feedback: user_feedback
      }
    });
    return getSingleThreadData.data;
  } catch (error) {
    console.error(error);
  }
};

export const dryRun = async ({ localDataToSend, bridge_id }) => {
  try {
    let dryRun
    const modelType = localDataToSend.configuration.type
    if (modelType !== 'completion' && modelType !== 'embedding') dryRun = await axios.post(`${PYTHON_URL}/api/v2/model/playground/chat/completion/${bridge_id}`, localDataToSend)
    if (modelType === "completion") dryRun = await axios.post(`${URL}/api/v1/model/playground/completion/${bridge_id}`, localDataToSend)
    if (modelType === "embedding") dryRun = await axios.post(`${URL}/api/v1/model/playground/embeddings/${bridge_id}`, localDataToSend)
    if (modelType !== 'completion' && modelType !== 'embedding') {
      return dryRun.data;
    }
    return { success: true, data: dryRun.data }
  } catch (error) {
    console.error("dry run error", error, error.response.data.error);
    toast.error(error?.response?.data?.error);
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
    toast.error(error.response.data.message)
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


export const createapi = async (dataFromEmbed) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/api/v1/config/createapi`, dataFromEmbed);
    return response?.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const updateapi = async (bridge_id, dataFromEmbed) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/api/v1/config/updateapi/${bridge_id}`, dataFromEmbed);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const publishBridgeVersionApi = async ({ versionId }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/versions/publish/${versionId}`);
    return response?.data;
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

export const createOrRemoveAction = async ({ orgId, bridgeId, versionId, type, dataToSend }) => {
  try {
    const response = await axios.post(`${URL}/chatbot/${orgId}/bridge/${bridgeId}/action?type=${type}`, { ...dataToSend, version_id: versionId });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const createDuplicateBridge = async (bridge_id) => {
  try {
    const response = await axios.post(
      `${PYTHON_URL}/bridge/duplicate`,
      { bridge_id }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getAllModels = async (service) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/api/v1/config/service/models/${service}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const saveApiKeys = async (data) => {
  try {
    const response = await axios.post(`${URL}/apikeys`, data);
    return response;
  } catch (error) {
    console.error(error);
    toast.error(error?.response?.data?.error);
    return error;
  }
}

export const updateApikey = async (dataToSend) => {
  try {
    const response = await axios.put(`${URL}/apikeys/${dataToSend.apikey_object_id}`, dataToSend)

    return response;
  } catch (error) {
    console.error(error)
    return error;
  }
}

export const deleteApikey = async (id) => {
  try {
    const response = await axios.delete(`${URL}/apikeys`, {
      data: { apikey_object_id: id },
    });
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};


export const getAllApikey = async (org_id) => {
  try {
    const response = await axios.get(`${URL}/apikeys`, org_id)
    return response;
  } catch (error) {
    console.error(error)
    return error;
  }
}

export const createWebhookAlert = async (dataToSend) => {
  try {
    const response = await axios.post(`${URL}/alerting`, dataToSend);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const updateWebhookAlert = async ({ data, id }) => {
  try {
    const response = await axios.put(`${URL}/alerting/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getAllWebhookAlert = async (org_id) => {
  try {
    const response = await axios.get(`${URL}/alerting`, org_id);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const deleteWebhookAlert = async (id) => {
  try {
    const response = await axios.delete(`${URL}/alerting`, {
      data: { id: id },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const downloadFineTuneData = async (bridge_id, threadIds, status = [0]) => {
  const response = await axios.post(`${URL}/api/v1/config/getFineTuneData/${bridge_id}`, { thread_ids: threadIds, user_feedback: status });
  return response?.data;
}


export const updateHistoryMessage = async ({ id, bridge_id, message }) => {
  const response = await axios.put(`${URL}/api/v1/config/gethistory/${bridge_id}`, { id: id, message: message })
  return response?.data;
}

export const updateFunctionApi = async ({ function_id, dataToSend }) => {
  try {
    const response = await axios.put(`${PYTHON_URL}/functions/${function_id}`, { dataToSend });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const archiveBridgeApi = async (bridge_id, newStatus) => {
  try {
    const response = await axios.put(`${URL}/api/v1/config/bridge-status/${bridge_id}`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};


export const optimizePromptApi = async ({ bridge_id, version_id, data = {version_id} }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/${bridge_id}/optimize/prompt`, data);
    return response.data.result;
  } catch (error) {
    console.error(error);
    return error
  }
};

export const discardBridgeVersionApi = async ({ bridgeId, versionId }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/versions/discard/${versionId}`, { bridge_id: bridgeId });
    return response.data;
  } catch (error) {
    console.error(error);
    return error
  }
};

export const userFeedbackCount = async ({ bridge_id, user_feedback }) => {
  try {
    const response = await axios.get(`${URL}/api/v1/config/userfeedbackcount/${bridge_id}`, {
      params: {
        user_feedback
      }
    });
    return response
  } catch (error) {
    console.error(error);
    return error
  }
}

export const getSubThreadIds = async ({ thread_id }) => {
  try {
    const response = await axios.get(`${URL}/api/v1/config/history/sub-thread/${thread_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error
  }
}

export const uploadImage = async (formData) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/image/processing/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Return the response data for further handling
  } catch (error) {
    console.error('Error uploading image:', error);
    // Extract error message if available
    const errorMessage = error.response?.data?.message || error.message || 'File upload failed.';
    throw new Error(errorMessage);
  }
};

export const getMetricsDataApi = async ({ apikey_id, service, model, thread_id, bridge_id, version_id, range, factor }) => {
  try {
    const response = await axios.post(`${URL}/metrics`, { apikey_id, service, model, thread_id, bridge_id, version_id, range, factor });
    return response.data?.data || [];
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function updateOrganizationData(orgId, orgDetails) {
  const updateObject = {
    company_id: orgId,
    company: orgDetails,
  };
  try {
    const response = await axios.put(`${URL}/user/updateDetails`, updateObject);
    const data = response?.data;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error; // Re-throw the error for the caller to handle
  }
}