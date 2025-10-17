import axios from "@/utils/interceptor";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

// Integration Management APIs
export const createIntegrationApi = async (data) => {
  try {
    const response = await axios.post(`${URL}/gtwyEmbed/`, data);
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

export const updateIntegrationData = async (dataToSend) => {
  try {
    const response = await axios.put(`${URL}/gtwyEmbed/`, {folder_id : dataToSend?.folder_id, ...dataToSend})
    return response
  } catch (error) {
    console.error(error)
    throw error
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

// Orchestrator APIs
export const createNewOrchestralFlow = async (data) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/orchestrator/`, data);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getAllOrchestralFlows = async () => {
  try {
    const response = await axios.get(`${PYTHON_URL}/orchestrator/all`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const updateOrchestralFlow = async (data, orchestratorId) => {
  try {
    const response = await axios.put(`${PYTHON_URL}/orchestrator/${orchestratorId}`, data);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const deleteOrchetralFlow = async (data) => {
  try {
    const response = await axios.delete(`${PYTHON_URL}/orchestrator/${data?._id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}
