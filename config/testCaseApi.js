import axios from "@/utils/interceptor";
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

// Test Case Management APIs
export const getAllTestCasesOfBridgeApi = async ({ bridgeId }) => {
  try {
    const response = await axios.get(`${URL}/testcases/${bridgeId}`);
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

export const updateTestCaseApi = async ({ bridge_id, dataToUpdate }) => {
  try {
    const response = await axios.put(`${URL}/testcases/`, { bridge_id, ...dataToUpdate });
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

export const runTestCaseApi = async ({ versionId, testcase_id, testCaseData, bridgeId }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/api/v2/model/testcases`, { "version_id": versionId, "testcases": true, "testcase_id": testcase_id, "testcase_data": testCaseData, "bridge_id": bridgeId });
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.detail?.error ? error?.response?.data?.detail?.error : "Error while running the testcases")
    console.error(error);
    return error;
  }
}

export const generateAdditionalTestCasesApi = async ({ bridgeId, versionId }) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/bridge/${bridgeId}/generateAdditionalTestCases`, {
      "version_id": versionId
    });
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.detail?.error ? error?.response?.data?.detail?.error : "Error while generating additional test cases")
    console.error(error);
    return error;
  }
}
