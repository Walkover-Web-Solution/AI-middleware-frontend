import { createSlice } from "@reduxjs/toolkit";

const initialState = {
 history : {} ,
 thread : {},
  loading: false,
  success : false
};

export const historyReducer = createSlice({
  name: "History",
  initialState,
  reducers: {
    fetchAllHistoryReducer : (state, action) => {
      state.history = action.payload.data 
      state.success = action.payload.success
    } ,
    fetchThreadReducer : (state, action) => {
        state.thread = action.payload.data 
      } 
  },
});

export const {
    fetchAllHistoryReducer ,
    fetchThreadReducer
} = historyReducer.actions;
export default historyReducer.reducer;
