import { getAllTestCasesOfBridgeApi } from "@/config";
import { getAllTestCasesReducer } from "../reducer/testCasesReducer";

export const getAllTestCasesOfBridgeAction = ({ bridgeId }) => async (dispatch) => {
    try {
        const response = await getAllTestCasesOfBridgeApi({ bridgeId });
        if (response?.success) {
            dispatch(getAllTestCasesReducer({ bridgeId, data: response?.result }))
        }
        return response.data.api;
    } catch (error) {
        console.error(error);
    }
};