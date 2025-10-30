import axios from "@/utils/interceptor";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;

// History and Thread Management APIs
export const getSingleMessage = async ({ bridge_id, message_id }) => {
  try {
    const messageData = await axios.get(`${URL}/api/v1/config/systemprompt/gethistory/${bridge_id}/${message_id}`)
    return messageData.data.system_prompt
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getSingleThreadData = async (threadId, bridgeId, subThreadId, nextPage, user_feedback, versionId, error, pagelimit = 40) => {
  try {
    const encodedThreadId = encodeURIComponent(threadId);
    const encodedBridgeId = encodeURIComponent(bridgeId);
    const encodedSubThreadId = encodeURIComponent(subThreadId || threadId);
    const encodedVersionId = versionId === 'undefined' ? undefined : encodeURIComponent(versionId);
    
    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/threads/${encodedThreadId}/${encodedBridgeId}?sub_thread_id=${encodedSubThreadId}&pageNo=${nextPage}&limit=${pagelimit}&version_id=${encodedVersionId}`, {
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

export const getHistory = async (bridgeId, page = 1, start, end, keyword = '', user_feedback, isErrorTrue, versionId) => {
  try {
    const getSingleThreadData = await axios.get(`${URL}/api/v1/config/history/${bridgeId}`, {
      params: {
        pageNo: page,
        limit: 40,
        startTime: start,
        endTime: end,
        keyword_search: keyword,
        user_feedback: user_feedback,
        error: isErrorTrue,
        version_id: (versionId === 'all'|| versionId === 'undefined') ? null : versionId
      }
    });
    return getSingleThreadData.data;
  } catch (error) {
    console.error(error);
  }
};

export const getSubThreadIds = async ({ thread_id, error, bridge_id, version_id }) => {
  try {
    const encodedThreadId = encodeURIComponent(thread_id);
    
    const response = await axios.get(`${URL}/api/v1/config/history/sub-thread/${encodedThreadId}`, {
      params: {
        error,
        bridge_id,
        version_id: (version_id === "all" || version_id === "undefined") ? null : version_id 
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return error
  }
}
export const getOrchestralHistory = async (orchestrator_id, page = 1,pageSize = 10,org_id ) => {
  try {
    const getOrchestralHistory = await axios.get(`${URL}/orchestrator/History/${orchestrator_id}`, {
      params: {
        page,
        pageSize,
      },
      org_id
    });
    console.log(getOrchestralHistory.data.data,"orchestralHistory")
    return getOrchestralHistory.data?.data
  } catch (error) {
    console.error(error);
    return error
  }
};
export const updateHistoryMessage = async ({ id, bridge_id, message }) => {
  const response = await axios.put(`${URL}/api/v1/config/gethistory/${bridge_id}`, { id: id, message: message })
  return response?.data;
}
