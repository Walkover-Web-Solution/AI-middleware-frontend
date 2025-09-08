import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orchetralFlowData: {},
  loading: false
};

export const orchetralFlowReducer = createSlice({
  name: "orchetralFlow",
  initialState,
  reducers: {
    fetchAllOrchetralFlowData: (state, action) => {
      state.orchetralFlowData[action.payload.orgId] = action.payload.data.data;
      state.loading = false;
    },
    addOrchetralFlowDataReducer: (state, action) => {
      const { orgId, data, orchestrator_id } = action.payload;
      if (state.orchetralFlowData[orgId]) {
        state.orchetralFlowData[orgId].push({ ...data, _id: orchestrator_id });
      } else {
        state.orchetralFlowData[orgId] = [{ ...data, _id: orchestrator_id }];
      }
    },
    deleteOrchetralFlowReducer: (state, action) => {
      const { orgId, id } = action.payload;
      if (state.orchetralFlowData[orgId]) {
        state.orchetralFlowData[orgId] = state.orchetralFlowData[orgId].filter(entry => entry._id !== id);
      }
    },
    updateOrchetralFlowDataReducer: (state, action) => {
      const { orgId, data, orchestrator_id } = action.payload;
      if (state.orchetralFlowData[orgId]) {
        state.orchetralFlowData[orgId] = state.orchetralFlowData[orgId].map(entry => 
          entry._id === orchestrator_id ? { ...data, orchestrator_id } : entry
        );
      }
    }
  }
});

export const {
  fetchAllOrchetralFlowData,
  addOrchetralFlowDataReducer,
  deleteOrchetralFlowReducer,
  updateOrchetralFlowDataReducer
} = orchetralFlowReducer.actions;

export default orchetralFlowReducer.reducer;
