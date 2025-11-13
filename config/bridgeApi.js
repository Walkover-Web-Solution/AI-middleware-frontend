import axios from "@/utils/interceptor";
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

// Bridge Management APIs
export const getSingleBridge = async (bridgeId) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/api/v1/config/getbridges/${bridgeId}`)
    return response
  } catch (error) {
    if (error.response) {
      throw error.response;
    } else {
      throw error;
    }
  }
}

export const getAllBridges = async () => {
  try {
    const data = await axios.get(`${PYTHON_URL}/api/v1/config/getbridges/all`)
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export const createBridge = async (dataToSend) => {
  try {
    return await axios.post(`${PYTHON_URL}/api/v1/config/create_bridge`, dataToSend)
  } catch (error) {
    toast.error(error.response.data.error)
    throw error
  }
}

export const updateBridge = async ({ bridgeId, dataToSend }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/api/v1/config/update_bridge/${bridgeId}`, dataToSend);
    return response
  } catch (error) {
    console.error(error)
    toast.error(error?.response?.data?.error);
    throw error;
  }
}

export const deleteBridge = async (bridgeId,org_id,restore=false) => {
  try {
    const response = await axios.delete(`${URL}/api/v1/config/deletebridges/${bridgeId}`,{data:{org_id,restore}});
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

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

export const archiveBridgeApi = async (bridge_id, newStatus) => {
  try {
    const response = await axios.put(`${URL}/api/v1/config/bridge-status/${bridge_id}`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error(error);
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

// Bridge Version APIs
export const getBridgeVersionApi = async ({ bridgeVersionId = null }) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/bridge/versions/get/${bridgeVersionId}`)
    return response?.data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
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

export const deleteBridgeVersionApi = async ({ versionId }) => {
  try {
    const response = await axios.delete(`${PYTHON_URL}/bridge/versions/${versionId}`);
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
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

export const publishBridgeVersionApi = async ({ versionId }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/versions/publish/${versionId}`);
    return response?.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const discardBridgeVersionApi = async ({ bridgeId, versionId }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/versions/discard/${versionId}`, { bridge_id: bridgeId });
    return response.data;
  } catch (error) {
    console.error(error);
    return error
  }
};

export const publishBulkVersionApi = async (version_ids) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/versions/bulk_publish`, { version_ids });
    return response;
  } catch (error) {
    console.error(error);
    throw new Error(error);
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

export const modelSuggestionApi = async ({ versionId }) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/bridge/versions/suggest/${versionId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
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

// Bridge Configuration History
export const getBridgeConfigHistory = async (versionId, page = 1, pageSize = 30) => {
  try {
    const response = await axios.get(`${URL}/api/v1/config/getuserupdates/${versionId}?page=${page}&limit=${pageSize}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching bridge config history:", error);
    throw new Error(error);
  }
};
