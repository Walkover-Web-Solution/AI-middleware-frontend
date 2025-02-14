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
      debugger
      const { orgId, data, docId, _id } = action.payload;
      if (state.knowledgeBaseData[orgId]) {
        state.knowledgeBaseData[orgId].push({ ...data, docId, _id });
      } else {
        state.knowledgeBaseData[orgId] = [{ ...data, docId, _id }];
      }
    },
  }
});

export const {
  fetchAllKnowlegdeBaseData,
  addKnowbaseDataReducer
} = knowledgeBaseReducer.actions;

export default knowledgeBaseReducer.reducer;
