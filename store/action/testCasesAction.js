import { createTestCaseApi, deleteTestCaseApi, getAllTestCasesOfBridgeApi } from "@/config";
import { createTestCaseReducer, deleteTestCaseReducer, getAllTestCasesReducer } from "../reducer/testCasesReducer";
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
            dispatch(getAllTestCasesReducer({ bridgeId, data: response?.result }))
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