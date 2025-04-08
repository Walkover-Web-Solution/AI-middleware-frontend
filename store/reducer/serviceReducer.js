import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  services: {},
};

export const serviceReducer = createSlice({
  name: "Service",
  initialState,
  reducers: {
    fetchServiceReducer: (state, action) => {
      const { data } = action.payload;
      state.services = data;
    }
  },
});

export const {
  fetchServiceReducer
} = serviceReducer.actions;
export default serviceReducer.reducer;
