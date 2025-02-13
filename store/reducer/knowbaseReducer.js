import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  knowbaseData: [],
  loading: false
};

export const knowbaseReducer = createSlice({
  name: "knowbase",
  initialState,
  reducers: {
    fetchAllKnowbaseData: (state, action) => {
      state.knowbaseData = action.payload;
      state.loading = false;
    },
    addKnowbaseData: (state, action) => {
      state.knowbaseData = [action.payload.data, ...state.knowbaseData];
    },
    removeKnowbaseData: (state, action) => {
      const id = action.payload;
      state.knowbaseData = state.knowbaseData.filter(item => item.id !== id);
    },
    updateKnowbaseData: (state, action) => {
      const { id, data } = action.payload;
      state.knowbaseData = state.knowbaseData.map(item => 
        item.id === id ? { ...item, ...data } : item
      );
    }
  }
});

export const {
  fetchAllKnowbaseData,
  addKnowbaseData,
  removeKnowbaseData,
  updateKnowbaseData
} = knowbaseReducer.actions;

export default knowbaseReducer.reducer;
