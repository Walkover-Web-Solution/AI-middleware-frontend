import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  serviceModels: {},
  loading: false,
};

export const modelReducer = createSlice({
  name: "Model",
  initialState,
  reducers: {
    fetchModelReducer: (state, action) => {
      const { data, service } = action.payload;
      state.serviceModels[service] = data;
    }
  },
});

export const {
  fetchModelReducer
} = modelReducer.actions;
export default modelReducer.reducer;
