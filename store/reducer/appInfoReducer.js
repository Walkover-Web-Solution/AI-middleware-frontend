import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  embedUserDetails: {},
  appInfo: {},
  loading: false,
  error: null
};

export const appInfoReducer = createSlice({
  name: "appInfo",
  initialState,
  reducers: {
    setEmbedUserDetails: (state, action) => {
      const validUpdates = Object.entries(action.payload).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      state.embedUserDetails = {
        ...state.embedUserDetails,
        ...validUpdates
      };
    },
    clearEmbedUserDetails: (state) => {
      state.embedUserDetails = {};
    },    
  }
});

export const {
  setEmbedUserDetails,
  clearEmbedUserDetails
} = appInfoReducer.actions;

export default appInfoReducer.reducer;
