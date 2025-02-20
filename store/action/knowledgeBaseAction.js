
import { createKnowledgeBaseEntry, deleteKnowBaseData, getAllKnowBaseData } from "@/config";

import { toast } from "react-toastify";
import { addKnowbaseDataReducer, deleteKnowledgeBaseReducer, fetchAllKnowlegdeBaseData } from "../reducer/knowledgeBaseReducer";



export const createKnowledgeBaseEntryAction = (data, orgId) => async (dispatch) => {
  try {
    const response = await createKnowledgeBaseEntry(data);
    if (response.data) {
      toast.success(response?.data?.message)
      dispatch(addKnowbaseDataReducer({ 
        orgId,
        data : response?.data,
        docId: response?.data?.doc_id, 
        _id: response?.data?.mongo_id 
      }))
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
export const deleteKnowBaseDataAction = ({data}) => async (dispatch) => {
  try {
    const response = await deleteKnowBaseData(data);
    if (response) {
      toast.success(response.message);
      dispatch(deleteKnowledgeBaseReducer({id:data?.id, orgId:data?.orgId}))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};


