import { createKnowledgeBaseEntry, deleteKnowBaseData, getAllKnowBaseData, getKnowledgeBaseToken, updateKnowledgeBaseEntry } from "@/config";

import { toast } from "react-toastify";
import { addKnowbaseDataReducer, deleteKnowledgeBaseReducer, fetchAllKnowlegdeBaseData, fetchKnowlegdeBaseToken, updateKnowledgeBaseReducer } from "../reducer/knowledgeBaseReducer";



export const createKnowledgeBaseEntryAction = (data, orgId) => async (dispatch) => {
  try {
    const response = await createKnowledgeBaseEntry(data);
    if (response.data) {
      toast.success(response?.data?.message)
      dispatch(addKnowbaseDataReducer({ 
        orgId,
        data : response?.data,
        _id: response?.data?._id 
      }))
    }
  } catch (error) {
    toast.error('something went wrong')
    console.error(error);
  }
};
export const getKnowledgeBaseTokenAction = (orgId) => async (dispatch) => {
    try {
      const response = await getKnowledgeBaseToken(); 
      if (response) {
        return { response };
      }
    } catch (error) {
      toast.error("something went wrong");
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

export const updateKnowledgeBaseAction = (data, orgId) => async (dispatch) => {
  try {
    const response = await updateKnowledgeBaseEntry(data);
    if (response.data) {
      toast.success(response?.data?.message);
      dispatch(updateKnowledgeBaseReducer({ 
        orgId,
        data: response?.data?.data,
        _id: response?.data?.data?._id
      }));
    }
  } catch (error) {
    toast.error('Something went wrong');
    console.error(error);
  }
};


