import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authData: [],
  loading: false
};

export const authDataReducer = createSlice({
  name: "authData",
  initialState,
  reducers: {
    fetchAllAuthData: (state, action) => {
      const { orgId, data } = action.payload;
      if (!state.authData[orgId]) {
        state.authData[orgId] = [];
      }
     if(data)
      state.authData[orgId] = [data];
    },
    addAuth: (state, action) => {
      const { orgId, data } = action.payload;
      if (!state.authData[orgId]) {
        state.authData[orgId] = [];
      }
      state.authData[orgId] = [data];
    }
  },
});

export const {
  fetchAllAuthData,
  addAuth
} = authDataReducer.actions;

export default authDataReducer.reducer;
