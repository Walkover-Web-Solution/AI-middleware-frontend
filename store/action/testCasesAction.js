import { createTestCaseApi, deleteTestCaseApi, getAllTestCasesOfBridgeApi, runTestCaseApi, updateTestCaseApi } from "@/config";
import { createTestCaseReducer, deleteTestCaseReducer, getAllTestCasesReducer, runTestCaseReducer, updateTestCaseReducer } from "../reducer/testCasesReducer";
import { toast } from "react-toastify";

export const createTestCaseAction = ({ bridgeId, data }) => async (dispatch) => {
    try {
        const response = await createTestCaseApi({ bridgeId, data });
        if (response?.success) {
            dispatch(createTestCaseReducer({ bridgeId, data: response?.result }));
            toast.success("Test case created successfully");
        }
        return;
    } catch (error) {
        console.error(error);
    }
}

export const getAllTestCasesOfBridgeAction = ({ bridgeId }) => async (dispatch) => {
    try {
        const response = await getAllTestCasesOfBridgeApi({ bridgeId });
        if (response?.success) {
            dispatch(getAllTestCasesReducer({ bridgeId, data: response?.data }))
        }
        return;
    } catch (error) {
        console.error(error);
    }
};

export const deleteTestCaseAction = ({ testCaseId, bridgeId }) => async (dispatch) => {
    try {
        const response = await deleteTestCaseApi({ testCaseId });
        if (response?.result?.success) {
            dispatch(deleteTestCaseReducer({ testCaseId, bridgeId }));
            toast.success("Test case deleted successfully");
        }
        return;
    } catch (error) {
        console.error(error);
    }
}

export const runTestCaseAction = ({ versionId, bridgeId }) => async (dispatch) => {
    try {
        const response = await runTestCaseApi({ versionId });
        if (response?.success) {
            // dispatch(runTestCaseReducer({ data: response?.response, bridgeId, versionId }));
            toast.success("Test case run successfully");
        }
        return;
    } catch (error) {
        console.error(error);
    }
}

export const updateTestCaseAction = ({ bridge_id, dataToUpdate }) => async (dispatch) => {
    try {
        const response = await updateTestCaseApi({ bridge_id, dataToUpdate });
        if (response?.success) {
            dispatch(updateTestCaseReducer({bridge_id, dataToUpdate}));
            toast.success("Test case updated successfully");
        }
        return;
    } catch (error) {
        console.error(error);
    }
}

