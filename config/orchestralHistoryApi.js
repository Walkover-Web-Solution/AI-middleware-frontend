import axios from "@/utils/interceptor";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const getOrchestralHistory = async (agentId, page = 1, limit = 30) => {
  try {
    const response = await axios.get(`${URL}/api/orchestrator-history/${agentId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrchestralHistoryThread = async (agentId, threadId, subThreadId) => {
  try {
    const encodedAgentId = encodeURIComponent(agentId);
    const encodedThreadId = encodeURIComponent(threadId);
    const encodedSubThreadId = encodeURIComponent(subThreadId);
    const response = await axios.get(
      `${URL}/api/orchestrator-history/${encodedAgentId}/${encodedThreadId}/${encodedSubThreadId}`
    );
    console.log(response.data,"helo")
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrchestralSubThreads = async ({ thread_id, bridge_id }) => {
  try {
    const encodedThreadId = encodeURIComponent(thread_id);
    const response = await axios.get(`${URL}/api/v1/config/history/sub-thread/${encodedThreadId}`, {
      params: {
        orchestral: true,
        bridge_id
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { threads: [], success: false };
  }
};
