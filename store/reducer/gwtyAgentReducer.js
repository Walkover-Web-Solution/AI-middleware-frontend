import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  gwtyAgent: {},
  loading: false
};

export const gtwyAgentReducer = createSlice({
  name: "gwtyAgent",
  initialState,
  reducers: {
    getAllAgent: (state, action) => {
      const agent = action.payload.data?.data;
      state.gwtyAgent.publicAgent = agent.filter(item => item.page_config.availability === 'public');
      state.gwtyAgent.privateAgent = agent.filter(item => item.page_config.availability === 'private');
      state.loading = false;
    },
    getPublicAgentData: (state, action) => {
      state.gwtyAgent.publicAgentData = action.payload.data;
      state.loading = false;
    },
    getPrivateAgentData: (state, action) => {
      state.gwtyAgent.privateAgentData = action.payload.data;
      state.loading = false;
    }
  }
});

export const {
  getAllAgent,
  getPublicAgentData,
  getPrivateAgentData
} = gtwyAgentReducer.actions;

export default gtwyAgentReducer.reducer;
