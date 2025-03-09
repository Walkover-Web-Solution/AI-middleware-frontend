import { deleteTestCaseApi, getAllTestCasesOfBridgeApi } from "@/config";
import { deleteTestCaseReducer, getAllTestCasesReducer } from "../reducer/testCasesReducer";
import { toast } from "react-toastify";

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