import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  integrationData: {},
  gtwyAccessToken: '',
  loading: false
};

export const integrationReducer = createSlice({
  name: "integration",
  initialState,
  reducers: {
    fetchAllIntegrationData: (state, action) => {
      state.integrationData[action.payload.orgId] = action.payload.data;
      state.loading = false;
    },
    addIntegrationDataReducer: (state, action) => {
      const { orgId, data, _id } = action.payload;
      if (state.integrationData[orgId]) {
        state.integrationData[orgId].push({ ...data, _id });
      } else {
        state.integrationData[orgId] = [{ ...data, _id }];
      }
    },
    deleteIntegrationReducer: (state, action) => {
      const { orgId, id } = action.payload;
      if (state.integrationData[orgId]) {
        state.integrationData[orgId] = state.integrationData[orgId].filter(entry => entry._id !== id);
      }
    }
  }
});

export const {
  fetchAllIntegrationData,
  addIntegrationDataReducer,
  deleteIntegrationReducer,
} = integrationReducer.actions;

export default integrationReducer.reducer;
