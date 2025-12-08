import axios from "@/utils/interceptor";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Knowledge Base Management APIs
export const createKnowledgeBaseEntry = async (data) => {
  try {
    const response = await axios.post(`${URL}/api/rag/`, data);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getAllKnowBaseData = async () => {
  try {
    const response = await axios.get(`${URL}/api/rag/docs`);
    return response?.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getKnowledgeBaseToken = async () => {
  try {
    const response = await axios.get(`${URL}/api/rag/docs/token`);
    return response?.data?.result;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const deleteKnowBaseData = async (data) => {
  try {
    const { id } = data;
    const response = await axios.delete(`${URL}/api/rag/docs/${id}`, {
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
    const response = await axios.patch(`${URL}/api/rag/docs/${id}`, dataToUpdate);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
