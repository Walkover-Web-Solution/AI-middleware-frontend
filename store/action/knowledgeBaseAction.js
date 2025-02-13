
import { createKnowledgeBaseEntry } from "@/config";

import { toast } from "react-toastify";

export const createKnowledgeBaseEntryAction = (data) => async (dispatch) => {
  try {
    const response = await createKnowledgeBaseEntry(data);
    if (response.data?.success) {
    //   dispatch(createKnowledgeBaseReducer({ orgId: data.orgId, data: response?.data?.entry }))
    }
    return response.data.entry;
  } catch (error) {
    console.error(error);
  }
};

// export const updateKnowledgeBaseEntryAction = (dataToSend) => async (dispatch) => {
//   try {
//     const response = await updateKnowledgeBaseEntry(dataToSend);
//     if (response.data.success)
//         console.log("hello");
        
//     //   dispatch(knowledgeBaseUpdateReducer({ 
//     //     orgId: dataToSend.orgId, 
//     //     id: dataToSend.id, 
//     //     data: response.data.entry 
//     //   }))
//   } catch (error) {
//     toast.error(error);
//     console.error(error);
//   }
// }

// export const deleteKnowledgeBaseEntryAction = ({ orgId, id }) => async (dispatch) => {
//   try {
//     const response = await deleteKnowledgeBaseEntry(id);
//     if (response.data.success){}
//     //   dispatch(knowledgeBaseDeleteReducer({ orgId, id }))
//   } catch (error) {
//     toast.error(error);
//     console.error(error);
//   }
// }

// export const getAllKnowledgeBaseEntriesAction = (orgId) => async (dispatch) => {
//   try {
//     const response = await getAllKnowledgeBaseEntries({ orgId });
//     // if (response.data.success)
//     //   dispatch(knowledgeBaseDataReducer({ orgId, data: response.data.result }))
//   } catch (error) {
//     console.error(error)
//     toast.error(error);
//   }
// }
