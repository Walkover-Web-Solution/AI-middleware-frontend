
import { createKnowledgeBaseEntry, getAllKnowBaseData } from "@/config";

import { toast } from "react-toastify";
import { addKnowbaseDataReducer, fetchAllKnowlegdeBaseData } from "../reducer/knowledgebaseReducer";



export const createKnowledgeBaseEntryAction = (data) => async (dispatch) => {
  try {
    const response = await createKnowledgeBaseEntry(data);
    if (response.data?.success) {
      toast.success(response?.data?.message)
      dispatch(addKnowbaseDataReducer({ orgId: data?.orgId, data, docId: response?.data?.doc_id, _id: response?.data?.mongo_id }))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};
export const getAllKnowBaseDataAction = (orgId) => async (dispatch) => {
  try {
    const response = await getAllKnowBaseData();
    if (response.data) {
      dispatch(fetchAllKnowlegdeBaseData({ data: response?.data, orgId }))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};
