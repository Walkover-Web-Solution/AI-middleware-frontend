import axios from "@/utils/interceptor";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

// Utility and Helper APIs
export const uploadImage = async (formData, isVedioOrPdf) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/image/processing/${isVedioOrPdf ? 'upload' : ''}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Return the response data for further handling
  } catch (error) {
    console.error('Error uploading image:', error);
    // Extract error message if available
    const errorMessage = error.response?.data?.message || error.response?.data?.detail?.error || error.message || 'File upload failed.';
    throw new Error(errorMessage);
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

export const improvePrompt =  async (variables) =>{
  try {
    const response = await axios.post(`${PYTHON_URL}/utils/improve_prompt`, {variables})
    return response?.data;
  } catch (error) {
    console.error(error)
    throw new Error(error);
  }
}

// AI Assistant Tools APIs
export const getPrebuiltPrompts = async ()=>{
  try{
     const getPrebuiltPrompts = await axios.get(`${PYTHON_URL}/prebuilt_prompt`)
     return getPrebuiltPrompts?.data?.data
  }
  catch(error){
    console.error(error)
    throw error
  }
}

export const updatePrebuiltPrompt = async (dataToSend) => {
  try {
    const response= await axios.put(`${PYTHON_URL}/prebuilt_prompt`, dataToSend)
    return response?.data?.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const resetPrebuiltPrompt = async (dataToSend) => {
  try {
    const response= await axios.post(`${PYTHON_URL}/prebuilt_prompt/reset`, dataToSend)
    return response?.data?.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

// Functions Management APIs
export const getAllFunctionsApi = async (org_id) => {
  try {
    const data = await axios.get(`${PYTHON_URL}/functions/all`, org_id)
    return data;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
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

export const getPrebuiltToolsApi = async () => {
  try {
    const response = await axios.get(`${PYTHON_URL}/api/v1/config/inbuilt/tools`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

// Webhook and Alerting APIs
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

// Integration and External APIs
export const updateFlow = async (embed_token, functionId, description,title) => {
  try {
    const response = await fetch(`https://flow-api.viasocket.com/projects/updateflowembed/${functionId}`, {
      method: "PUT",
      headers: {
        "Authorization": embed_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "description": description,
        "title": title,
        "endpoint_name": title
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

// Marketing and External Service APIs
export const storeMarketingRefUser = async (data) => {
  try {
    const response = await axios.post("https://flow.sokt.io/func/scribmgUXqSE", data);
    return response;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

// Tutorial and Guide APIs
export const getTutorial =async ()=>{
  try {
    const response=await axios.get("https://flow.sokt.io/func/scri33jNs1M1");
    return response;
  }
  catch(error){
    throw new Error(error);
  }
}

export const getApiKeyGuide =async ()=>{
  try {
    const response=await axios.get("https://flow.sokt.io/func/scriDewB9Jk2");
    return response;
  }
  catch(error){
    throw new Error(error);
  }
}

export const getDescriptions =async()=>{
   try{
    const response=await axios.get("https://flow.sokt.io/func/scriPqFeiEKa")
    return response;
   }
   catch(error){
    throw new Error(error);
   }
}

export const getGuardrailsTemplates=async()=>{
  try {
    const response=await axios.get("https://flow.sokt.io/func/scriKh8LMVKV");
    return response;
  }
  catch(error){
    throw new Error(error);
  }
}

// Showcase APIs
export const getAllShowCase = async () => {
  try {
    const response = await axios.get(`${URL}/showcase/all`);
    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
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
