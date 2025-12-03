import axios from "@/utils/interceptor";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const getSingleMessage = async ({ bridge_id, message_id }) => {
  try {
    const messageData = await axios.get(`${URL}/api/v1/config/systemprompt/gethistory/${bridge_id}/${message_id}`)
    return messageData.data.system_prompt
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getSingleThreadData = async (threadId, bridgeId, subThreadId, nextPage, user_feedback, _versionId, error, pagelimit = 40) => {
  try {
    const encodedThreadId = encodeURIComponent(threadId);
    const encodedBridgeId = encodeURIComponent(bridgeId);
    const encodedSubThreadId = encodeURIComponent(subThreadId || threadId);
    
    const getSingleThreadData = await axios.get(`${URL}/history/${encodedBridgeId}/${encodedThreadId}/${encodedSubThreadId}?page=${nextPage}&limit=${pagelimit}`, {
      params: {
        user_feedback,
        error,
      }
    })
    return getSingleThreadData
  } catch (error) {
    console.error(error)
  }
}

export const getThreads = async (bridgeId, page = 1, user_feedback, isErrorTrue, versionId) => {
  try {
    const getSingleThreadData = await axios.get(`${URL}/history/threads/${bridgeId}`, {
      params: {
        page: page && !isNaN(page) ? page : 1,
        limit: 40,
        user_feedback: !user_feedback || user_feedback === "undefined" ? "all" : user_feedback,
        version_id: (versionId === 'all'|| versionId === 'undefined') ? null : versionId
      }
    });
    return getSingleThreadData.data;
  } catch (error) {
    console.error(error);
  }
};


export const searchMessageHistory = async(bridgeId, keyword, time_range) =>{
  try {
    const searchResult = await axios.post(`${URL}/history/search/${bridgeId}`,{
      keyword,
      time_range: time_range || {}
    })
    return searchResult;
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
}

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

export const updateHistoryMessage = async ({ id, bridge_id, message }) => {
  const response = await axios.put(`${URL}/api/v1/config/gethistory/${bridge_id}`, { id: id, message: message })
  return response?.data;
}
