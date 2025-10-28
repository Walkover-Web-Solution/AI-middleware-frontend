import { createNewOrchestralFlow, deleteOrchetralFlow, getAllOrchestralFlows, updateOrchestralFlow } from "@/config";
import { toast } from "react-toastify";
import { addOrchetralFlowDataReducer, deleteOrchetralFlowReducer, fetchAllOrchetralFlowData, updateOrchetralFlowDataReducer } from "../reducer/orchestralFlowReducer";


export const createNewOrchestralFlowAction = (data, orgId) => async (dispatch) => {
  try {
    const response = await createNewOrchestralFlow(data);
    if (response.data) {
      toast.success(response?.data?.message)
      dispatch(addOrchetralFlowDataReducer({ 
        orgId,
        data,
        orchestrator_id: response?.data?.data?.orchestrator_id 
      }))
    }
    return {data:{id: response.data.data.orchestrator_id}};
  } catch (error) {
    toast.error('something went wrong',error)
    console.error(error);
  }
};

export const getAllOrchestralFlowAction = (orgId) => async (dispatch) => {
  try {
    const response = await getAllOrchestralFlows();
    if (response.data) {
      dispatch(fetchAllOrchetralFlowData({ data: response?.data, orgId }))
    }
  } catch (error) {
    toast.error('something went wrong',error)
    console.error(error);
  }
};

export const deleteOrchetralFlowAction = ({data}) => async (dispatch) => {
  try {
    const response = await deleteOrchetralFlow(data);
    if (response.data) {
      dispatch(deleteOrchetralFlowReducer({id:data?._id, orgId:data?.orgId}))
    }
  } catch (error) {
    toast.error('something went wrong',error)
    console.error(error);
  }
};

export const updateOrchestralFlowAction = (data, orgId, orchestratorId) => async (dispatch) => {
  try {
    const response = await updateOrchestralFlow(data, orchestratorId);
    if (response.data?.data?.orchestrator_id) {
      dispatch(updateOrchetralFlowDataReducer({ 
        orgId,
        data : {...data, _id: orchestratorId},
        orchestrator_id: orchestratorId
      }));
    }
    return {data:{id: orchestratorId}};
  } catch (error) {
    toast.error('Something went wrong',error);
    console.error(error);
  }
};

export const discardOrchestralFlowAction = (originalData, orgId, orchestratorId) => async (dispatch) => {
  try {
    const response = await updateOrchestralFlow(originalData, orchestratorId);
    if (response.data?.data?.orchestrator_id) {
      toast.success('Changes discarded successfully');
      dispatch(updateOrchetralFlowDataReducer({ 
        orgId,
        data : {...originalData, _id: orchestratorId},
        orchestrator_id: orchestratorId
      }));
    }
    return {data:{id: orchestratorId}};
  } catch (error) {
    toast.error('Failed to discard changes');
    console.error(error);
    throw error;
  }
};


