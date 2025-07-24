"use client"

import axios from "@/utils/interceptor";
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
const NEXT_PUBLIC_REFERENCEID = process.env.NEXT_PUBLIC_REFERENCEID

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
    toast.error("Failed to delete the agent");
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

export const getSingleThreadData = async (threadId, bridgeId, subThreadId, nextPage, user_feedback, versionId, error, pagelimit = 40) => {
  try {
    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/threads/${threadId}/${bridgeId}?sub_thread_id=${subThreadId || threadId}&pageNo=${nextPage}&limit=${pagelimit}&version_id=${versionId === 'undefined' ? undefined : versionId}`, {
      params: {
        user_feedback,
        error
      }
    })
    return getSingleThreadData
  } catch (error) {
    console.error(error)
  }
}

export const getHistory = async (bridgeId, page = 1, start, end, keyword = '', user_feedback, isErrorTrue) => {
  try {

    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/history/${bridgeId}`, {
      params: {
        pageNo: page,
        limit: 40,
        startTime: start,
        endTime: end,
        keyword_search: keyword,
        user_feedback: user_feedback,
        error: isErrorTrue
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
    if (modelType === "embedding") dryRun = await axios.post(`${PYTHON_URL}/api/v2/model/playground/chat/completion/${bridge_id}`, localDataToSend)
    if (modelType !== 'completion' && modelType !== 'embedding') {
      return dryRun.data;
    }
    return { success: true, data: dryRun.data }
  } catch (error) {
    console.error("dry run error", error, error.response.data.error);
    toast.error(error?.response?.data?.error || error?.response?.data?.detail?.error || "Something went wrong.");
    return { success: false, error: error.response.data.error }
  }
}

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

export const allAuthKey = async (name = null) => {
  try {
    let url = `${PROXY_URL}/api/c/authkey`;
    
    // If name is provided, add it as a query parameter
    if (name) {
      url += `?name=${encodeURIComponent(name)}`;
    }
    
    const response = await axios(url);
    return response?.data?.data;
  } catch (error) {
    console.error(error);
    throw error;
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
    localStorage.setItem("current_org_id", company_ref_id);
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

export const getInvitedUsers = async ({page, limit}) => {
  try {
    const data = await axios.get(`${PROXY_URL}/api/c/getUsers`, {
      params: {
        pageNo:page,
        itemsPerPage:limit
      }
    });
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
export const updateFlowDescription = async (embed_token, functionId, description) => {
  try {
    const response = await fetch(`https://flow-api.viasocket.com/projects/updateflowembed/${functionId}`, {
      method: "PUT",
      headers: {
        "Authorization": embed_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "description": description
      })
    });
    
    const data = await response.json();
    return data.data;

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

export const addorRemoveBridgeInChatBot = async (orgId, botId, bridgeId, type) => {
  try {
    const response = await axios.put(`${URL}/chatbot/${orgId}/${botId}/bridge/${bridgeId}?type=${type}`);
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

export const optimizePromptApi = async ({ bridge_id, version_id, query, thread_id, data = { query, thread_id, version_id} }) => {
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

export const getSubThreadIds = async ({ thread_id, error, bridge_id }) => {
  try {
    const response = await axios.get(`${URL}/api/v1/config/history/sub-thread/${thread_id}`, {
      params: {
        error,
        bridge_id
      }
    });
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

export const optimizeSchemaApi = async ({ data }) => {

  try {
    const response = await axios.post(
      `${PYTHON_URL}/utils/structured_output`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const updateUser = async ({ user_id, user }) => {
  const updateObject = { user_id, user: {"meta": user?.meta} };
  try {
    const response = await axios.put(`${URL}/user/updateDetails`, updateObject);
    return response?.data;
  } catch (error) {
    console.error('Error updating details:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Something went wrong');
  }
};

export const updateOrganizationData = async (orgId, orgDetails) => {
  const updateObject = {
    company_id: orgId,
    company: orgDetails,
  };
  try {
    const response = await axios.put(`${URL}/user/updateDetails`, updateObject, {
      headers: {
        'reference-id': NEXT_PUBLIC_REFERENCEID
      }
    });
    return response.data;
  } catch (error) {

    toast.error('Error updating organization:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Organization update failed.';
  }
};

export const genrateSummary = async (version_id) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/summary`, { version_id: version_id.versionId })
    return response.data.result;
  } catch (error) {
    toast.error(error)
  }
};

export const batchApi = async ({ payload }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/api/v2/model/batch/chat/completion`, payload);
    return response.data;
  } catch (error) {
    console.error('Error in batch API:', error);
    throw error;
  }
}

export const createKnowledgeBaseEntry = async (data) => {
  try {
    const response = await axios.post(`${URL}/rag/`, data);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const getAllKnowBaseData = async () => {
  try {
    const response = await axios.get(`${URL}/rag/docs`);
    return response?.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const deleteKnowBaseData = async (data) => {
  try {
    const { id, orgId } = data;
    const response = await axios.delete(`${URL}/rag/docs/${id}`, {
      data: { id }
    });
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateKnowledgeBaseEntry = async (data) => {
  try {
    const { data: dataToUpdate, id } = data?.data;
    const response = await axios.patch(`${URL}/rag/docs/${id}`, dataToUpdate);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};



export const generateAccessKey = async () => {
  try {
    const response = await axios.get(`${URL}/org/auth_token`);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const getTestcasesScrore = async (version_id) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/bridge/versions/testcases/${version_id}`)
    return response.data;
  } catch (error) {
    console.error("error while getting testcase score", error);
  }
}


export const getAllShowCase = async () => {
  try {
    const response = await axios.get(`${URL}/showcase/all`);
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const optimizeJsonApi = async ({ data }) => {
  try {
    const response = await axios.post(
      `${PYTHON_URL}/bridge/genrate/rawjson`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getAllTestCasesOfBridgeApi = async ({ bridgeId }) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/testcases/${bridgeId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const deleteTestCaseApi = async ({ testCaseId }) => {
  try {
    const response = await axios.delete(`${URL}/testcases/`, {
      data: { id: testCaseId }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const createTestCaseApi = async ({ bridgeId, data }) => {
  try {
    const response = await axios.post(`${URL}/testcases/`, { bridge_id: bridgeId, ...data });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const runTestCaseApi = async ({ versionId }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/api/v2/model/testcases/${versionId}`, { "version_id": versionId });
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.detail?.error ? error?.response?.data?.detail?.error : "Error while running the testcases")
    console.error(error);
    return error;
  }
}

export const getOrCreateNotificationAuthKey = async (name) => {
  try {
    // First, get the notification auth key by name
    const notificationAuthKeys = await allAuthKey(name);
    
    // Check if the notification auth key exists
    const notificationAuthKey = notificationAuthKeys?.data?.length > 0 ? notificationAuthKeys?.data[0] : null;
    
    if (notificationAuthKey) {
      // If it exists, return it
      return notificationAuthKey;
    } else {
      // If it doesn't exist, create it
      const dataToSend = {
        name: name,
        throttle_limit: "60:800",
        temporary_throttle_limit: "60:600",
        temporary_throttle_time: "30"
      };
      
      const response = await createAuthKey(dataToSend);
      return response?.data;
    }
  } catch (error) {
    console.error("Error in getOrCreateNotificationAuthKey:", error);
    throw error;
  }
};

export const updateTestCaseApi = async ({ bridge_id, dataToUpdate }) => {
  try {
    const response = await axios.put(`${URL}/testcases/`, { bridge_id, ...dataToUpdate });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const deleteFunctionApi = async (function_name) => {
  try {
    const response = await axios.delete(`${PYTHON_URL}/functions/`, {
      data: { function_name }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getBridgeConfigHistory = async (versionId, page = 1, pageSize = 30) => {
  try {
    const response = await axios.get(`${URL}/api/v1/config/getuserupdates/${versionId}?page=${page}&limit=${pageSize}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching bridge config history:", error);
    throw new Error(error);
  }
};

export const createBridgeWithAiAPi = async ({ ...dataToSend }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/api/v1/config/create_bridge_using_ai`, dataToSend);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getAllServices = async () => {
  try {
    const response = await axios.get(`${PYTHON_URL}/api/v1/config/service`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const modelSuggestionApi = async ({ versionId }) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/bridge/versions/suggest/${versionId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getPrebuiltToolsApi = async () => {
  try {
    const response = await axios.get(`${PYTHON_URL}/api/v1/config/inbuilt/tools`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export const getTutorial =async ()=>{
  try {
    const response=await axios.get("https://flow.sokt.io/func/scri33jNs1M1");
    return response;
  }
  catch(error){
    throw new Error(error);
  }
}

export const createIntegrationApi = async (name) => {
  try {
    const response = await axios.post(`${URL}/gtwyEmbed/`, {name});
    return response?.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}
export const getAllIntegrationApi = async () => {
  try {
    const response = await axios.get(`${URL}/gtwyEmbed/`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}
  
export const generateGtwyAccessTokenApi = async () => {
  try {
    const response = await axios.get(`${URL}/gtwyEmbed/token`);
    return response;
  } catch (error) {
    console.error(error);
    return error;

  }
}

export const getAuthData = async () => {
  try {
    const response = await axios.get(`${URL}/auth/`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const createNewAuth = async (data) => {
  try {
    const response = await axios.post(`${URL}/auth/`, data);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const verifyAuth = async (data)=>{
  try {
    const respnse = await axios.post(`${URL}/auth/verify`, data)
    return respnse
  } catch (error) {
    console.error(error)
    return error
  }
}

export const getClientInfo = async (client_id)=>{
  try {
    const respnse = await axios.get(`${URL}/auth/client_info?client_id=${client_id}`)
    return respnse?.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const addNewModel = async(newModelObj) =>{
  try {
    const response = await axios.post(`${URL}/modelConfiguration/user`, newModelObj)
    return response;
  } catch (error) {
    console.log(error)
    toast.error(error?.response?.data?.error)
  }
}
export const deleteModel = async(dataToSend) =>{
  try {
    const response = await axios.delete(`${URL}/modelConfiguration/user?${new URLSearchParams(dataToSend).toString()}`)
    toast.success(response?.data?.message)
    return response;
  } catch (error) {
    console.log(error)
    toast.error(error?.response?.data?.error || error?.response?.data?.message )
    throw error
  }
}

export const getAllAgentsApi = async () => {
  try {
    const response = await axios.get(`${PYTHON_URL}/publicAgent/all`);
    return response;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export const publicAgentLoginApi = async () =>{
  try {
    const repsonse = await axios.post(`${PYTHON_URL}/publicAgent/public/login`)
    return repsonse;
  } catch (error) {
    console.error(error)
    throw new Error(error);
  }
}
  
export const privateAgentLoginApi = async () => {
  try {
    const response = await axios.post(`${PYTHON_URL}/publicAgent/login`)
    return response;
  } catch (error) {
    console.error(error)
    throw new Error(error);
  }
} 
