import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  knowledgeBaseData: {},
  knowledgeBaseBackup: {},
  loading: false,
  // New State for Hippo Collections
  collections: [],
  resourcesByCollection: {},
  loadingCollections: false,
};

export const knowledgeBaseReducer = createSlice({
  name: "knowledgeBase",
  initialState,
  reducers: {
    // ... existing reducers
    knowledgeBaseRollBackReducer: (state, action) => {
      const { orgId } = action.payload;
      // Only restore if we have a backup
      if (state.knowledgeBaseBackup && state.knowledgeBaseBackup[orgId]) {
        // Restore from backup
        state.knowledgeBaseData[orgId] = [...state.knowledgeBaseBackup[orgId]];
      }
    },

    fetchAllKnowlegdeBaseData: (state, action) => {
      state.knowledgeBaseData[action.payload.orgId] = action.payload.data;
      state.loading = false;
    },

    addKnowbaseDataReducer: (state, action) => {
      const { orgId, data, docId, _id } = action.payload;
      if (state.knowledgeBaseData[orgId]) {
        state.knowledgeBaseData[orgId].push({ ...data, docId, _id });
      } else {
        state.knowledgeBaseData[orgId] = [{ ...data, docId, _id }];
      }
    },
    deleteKnowledgeBaseReducer: (state, action) => {
      const { orgId, id } = action.payload;
      if (state.knowledgeBaseData[orgId]) {
        // Handle both property naming patterns (id and _id)
        state.knowledgeBaseData[orgId] = state.knowledgeBaseData[orgId].filter(entry => {
          // If the entry has _id property, compare with that
          if (entry._id) return entry._id !== id;
          // If the entry has id property, compare with that
          if (entry.id) return entry.id !== id;
          // Default case - shouldn't happen but just in case
          return true;
        });
      }
    },
    // Create a backup of knowledge base data before making changes
    backupKnowledgeBaseReducer: (state, action) => {
      const { orgId } = action.payload;

      // Make sure the backup object exists
      if (!state.knowledgeBaseBackup) {
        state.knowledgeBaseBackup = {};
      }

      // Only create backup if data exists for this org
      if (state.knowledgeBaseData && state.knowledgeBaseData[orgId]) {
        // Use deep cloning to avoid reference issues
        state.knowledgeBaseBackup[orgId] = state.knowledgeBaseData[orgId];
      } else {
        state.knowledgeBaseBackup[orgId] = [];
      }
    },

    // Restore from backup when API call fails
    updateKnowledgeBaseReducer: (state, action) => {
      const { orgId, data, _id } = action.payload;
      if (state.knowledgeBaseData[orgId]) {
        state.knowledgeBaseData[orgId] = state.knowledgeBaseData[orgId].map(entry =>
          entry._id === _id ? { ...data, _id } : entry
        );
      }
    },

    // --- New Reducers for Collections ---
    setCollections: (state, action) => {
      state.collections = action.payload;
      state.loadingCollections = false;
    },
    setLoadingCollections: (state, action) => {
      state.loadingCollections = action.payload;
    },
    addCollection: (state, action) => {
      state.collections.unshift(action.payload);
    },
    updateResourcesInCollection: (state, action) => {
      const { collectionId, resources } = action.payload;
      state.resourcesByCollection[collectionId] = resources;
    },
    addResourceToCollection: (state, action) => {
      const { collectionId, resource, newResourceId } = action.payload;
      // Update resources map
      const currentResources = state.resourcesByCollection[collectionId] || [];
      state.resourcesByCollection[collectionId] = [...currentResources, resource];

      // Update collection resource_ids
      state.collections = state.collections.map(col => {
        if (col.collection_id === collectionId) {
          return {
            ...col,
            resource_ids: [...(col.resource_ids || []), newResourceId]
          };
        }
        return col;
      });
    },
    updateResourceInState: (state, action) => {
      const { collectionId, resourceId, updates } = action.payload;
      const currentResources = state.resourcesByCollection[collectionId] || [];
      state.resourcesByCollection[collectionId] = currentResources.map(res =>
        (res._id === resourceId || res.id === resourceId) ? { ...res, ...updates } : res
      );
    },
    removeResourceFromState: (state, action) => {
      const { collectionId, resourceId } = action.payload;
      // Update resources map
      const currentResources = state.resourcesByCollection[collectionId] || [];
      state.resourcesByCollection[collectionId] = currentResources.filter(res => res._id !== resourceId && res.id !== resourceId);

      // Update collection resource_ids
      state.collections = state.collections.map(col => {
        if (col.collection_id === collectionId) {
          return {
            ...col,
            resource_ids: (col.resource_ids || []).filter(id => id !== resourceId)
          };
        }
        return col;
      });
    },
    setResourcesForCollection: (state, action) => {
      const { collectionId, resources } = action.payload;
      state.resourcesByCollection[collectionId] = resources;
    },
  }
});

export const {
  fetchAllKnowlegdeBaseData,
  addKnowbaseDataReducer,
  deleteKnowledgeBaseReducer,
  updateKnowledgeBaseReducer,
  backupKnowledgeBaseReducer,
  knowledgeBaseRollBackReducer,
  setCollections,
  setLoadingCollections,
  addCollection,
  updateResourcesInCollection,
  addResourceToCollection,
  updateResourceInState,
  removeResourceFromState,
  setResourcesForCollection
} = knowledgeBaseReducer.actions;

export default knowledgeBaseReducer.reducer;
