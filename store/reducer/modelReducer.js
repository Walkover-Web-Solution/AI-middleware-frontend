import { createSlice } from "@reduxjs/toolkit";

const initialState = {
 model : [] ,
 modelInfo : [],
  loading: false,
};

export const modelReducer = createSlice({
  name: "Model",
  initialState,
  reducers: {
    fetchModelReducer : (state, action) => {
      state.model = action.payload.models
      state.modelInfo = action.payload.modelInfo
    } 
  },
});

export const {
    fetchModelReducer
} = modelReducer.actions;
export default modelReducer.reducer;
