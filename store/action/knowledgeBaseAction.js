import { createKnowledgeBaseEntry, deleteKnowBaseData, getAllKnowBaseData, getKnowledgeBaseToken, updateKnowledgeBaseEntry } from "@/config/index";
import {
  createCollection,
  getCollections,
  createResource,
  updateResource,
  deleteResource,
  getResourcesByCollectionId
} from "@/config/knowledgeBaseHippoApi"; // New API imports

import { toast } from "react-toastify";
import {
  addKnowbaseDataReducer,
  backupKnowledgeBaseReducer,
  deleteKnowledgeBaseReducer,
  fetchAllKnowlegdeBaseData,
  knowledgeBaseRollBackReducer,
  updateKnowledgeBaseReducer,
  // New reducers
  setCollections,
  setLoadingCollections,
  addCollection,
  addResourceToCollection,
  updateResourceInState,
  removeResourceFromState,
  updateResourcesInCollection,
  setResourcesForCollection
} from "../reducer/knowledgeBaseReducer";
import posthog from "@/utils/posthog";



export const createKnowledgeBaseEntryAction = (data, orgId) => async (dispatch) => {

  try {
    const response = await createKnowledgeBaseEntry(data);
    if (response.data) {
      toast.success(response?.data?.message)
      dispatch(addKnowbaseDataReducer({
        orgId,
        data: response?.data,
        _id: response?.data?._id
      }))

      posthog.capture('knowledge_base_created', {
        knowledge_base_data: response?.data,
        org_id: orgId
      });

      return response?.data
    }
  } catch (error) {
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

export const deleteKnowBaseDataAction = ({ data }) => async (dispatch) => {
  try {
    // Step 1: Create a backup of the current state
    dispatch(backupKnowledgeBaseReducer({ orgId: data?.orgId }));
    dispatch(deleteKnowledgeBaseReducer({ id: data?.id, orgId: data?.orgId }))
    const response = await deleteKnowBaseData(data);
    if (response) {
      toast.success(response.message);

      posthog.capture('knowledge_base_deleted', {
        knowledge_base_deleted: response,
        org_id: data?.orgId
      });
    }
  } catch (error) {
    dispatch(knowledgeBaseRollBackReducer({ orgId: data?.orgId }));
    console.error(error);
  }
};

export const updateKnowledgeBaseAction = (data, orgId) => async (dispatch) => {
  try {
    dispatch(backupKnowledgeBaseReducer({ orgId }));
    dispatch(updateKnowledgeBaseReducer({
      orgId,
      data: data,
      _id: data?._id
    }));
    const response = await updateKnowledgeBaseEntry(data);
    if (response.data) {
      toast.success(response?.data?.message);
      dispatch(updateKnowledgeBaseReducer({
        orgId,
        data: response?.data?.data,
        _id: response?.data?.data?._id
      }));

      posthog.capture('knowledge_base_updated', {
        knowledge_base_data: response?.data?.data,
        org_id: orgId
      });
    }
  } catch (error) {
    dispatch(knowledgeBaseRollBackReducer({ orgId }));
    console.error(error);
  }
};

// --- New Hippo Knowledge Base Actions ---

export const getCollectionsAction = () => async (dispatch) => {
  dispatch(setLoadingCollections(true));
  try {
    const response = await getCollections();
    if (response?.success) {
      dispatch(setCollections(response?.data || []));
    }
  } catch (error) {
    console.error("Error fetching collections:", error);
    toast.error("Failed to load collections");
  } finally {
    dispatch(setLoadingCollections(false));
  }
};

export const createCollectionAction = (payload) => async (dispatch) => {
  try {
    const response = await createCollection(payload);
    if (response?.success) {
      // Note: If the response contains the full collection object, we add it directly.
      // If the backend returns just ID/status, we might need to re-fetch or construct it.
      // Assuming the API returns the created object or we refetch.
      // Page.js re-fetched, but optimized Redux should just add it if possible.
      // Let's assume re-fetching or response.data contains the object.
      // Actually, Page.js logic was: `await fetchCollections()`.
      // Let's optimize by dispatching addCollection if response.data is the object.
      // createCollection API returns `response?.data`.

      // Re-fetching is safer for now to ensure consistency, but if we want to be "Redux-y",
      // we should trust the response. Let's start with re-fetching to be safe 
      // OR check the response structure.
      // Wait, createCollection calls `axios.post`. response is `response?.data`.
      // If `response.success` is true, `response.data` is the payload? 
      // In Page.js: `await fetchCollections()` was called. 
      // I'll call `dispatch(getCollectionsAction())` to be safe and simple.
      dispatch(getCollectionsAction());
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { success: false };
  }
};

export const createResourceAction = (payload, activeCollection) => async (dispatch) => {
  try {
    const response = await createResource(payload);
    if (response?.success) {
      const resourceData = response?.data || {};
      const newResourceId = resourceData?._id || resourceData?.id;

      dispatch(addResourceToCollection({
        collectionId: activeCollection.collection_id,
        resource: {
          ...resourceData,
          // Ensure local state consistency
          collection_id: activeCollection.collection_id
        },
        newResourceId
      }));
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error("Error creating resource:", error);
    return { success: false };
  }
};

export const updateResourceAction = (resourceId, payload, activeCollection) => async (dispatch) => {
  try {
    const response = await updateResource(resourceId, payload);
    if (response?.success) {
      dispatch(updateResourceInState({
        collectionId: activeCollection.collection_id,
        resourceId: resourceId,
        updates: response.data || payload
      }));
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error("Error updating resource:", error);
    return { success: false };
  }
};

export const deleteResourceAction = (resourceId, collectionId) => async (dispatch) => {
  try {
    const response = await deleteResource(resourceId);
    if (response?.success) {
      dispatch(removeResourceFromState({
        collectionId,
        resourceId
      }));
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error("Error deleting resource:", error);
    return { success: false };
  }
};

// Helper action to manually set resources for a collection (e.g. merging IDs with local ones)
export const setResourcesForCollectionAction = (collectionId, resources) => (dispatch) => {
  dispatch(updateResourcesInCollection({ collectionId, resources }));
};

export const getResourcesForCollectionAction = (collectionId) => async (dispatch) => {
  try {
    const response = await getResourcesByCollectionId(collectionId);
    if (response?.success) {
      dispatch(setResourcesForCollection({
        collectionId,
        resources: response.data.resources || (Array.isArray(response.data) ? response.data : []) // Handle flexible response structure
      }));
      return { success: true };
    }
  } catch (error) {
    console.error("Error fetching resources for collection:", error);
    return { success: false };
  }
};
