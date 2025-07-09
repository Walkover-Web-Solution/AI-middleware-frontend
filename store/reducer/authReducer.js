import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authData: [],
  loading: false
};

export const authDataReducer = createSlice({
  name: "authReducer",
  initialState,
  reducers: {
    fetchAllAuthData: (state, action) => {
      const { orgId, data } = action.payload;
      if (!state.authData[orgId]) {
        state.authData[orgId] = [];
      }
      state.authData[orgId] = [data];
    },
    addAuth: (state, action) => {
      const { orgId, data } = action.payload;
      if (!state.authData[orgId]) {
        state.authData[orgId] = [];
      }
      state.authData[orgId] = [data, ...state.authData[orgId]];
    }
  },
});

export const {
  fetchAllAuthData,
  addAuth
} = authDataReducer.actions;

export default authDataReducer.reducer;
