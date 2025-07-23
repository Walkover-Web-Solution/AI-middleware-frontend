import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  knowledgeBaseData: {},
  loading: false
};

export const knowledgeBaseReducer = createSlice({
  name: "knowledgeBase",
  initialState,
  reducers: {
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
        state.knowledgeBaseData[orgId] = state.knowledgeBaseData[orgId].filter(entry => entry._id !== id);
      }
    },
    updateKnowledgeBaseReducer: (state, action) => {
      const { orgId, data, _id } = action.payload;
      if (state.knowledgeBaseData[orgId]) {
        state.knowledgeBaseData[orgId] = state.knowledgeBaseData[orgId].map(entry => 
          entry._id === _id ? { ...data, _id } : entry
        );
      }
    }
  }
});

export const {
  fetchAllKnowlegdeBaseData,
  addKnowbaseDataReducer,
  deleteKnowledgeBaseReducer,
  updateKnowledgeBaseReducer,
  fetchKnowlegdeBaseToken
} = knowledgeBaseReducer.actions;

export default knowledgeBaseReducer.reducer;
