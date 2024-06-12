import { createSlice } from "@reduxjs/toolkit";

const initialState = {
 history : [] ,
 thread : [],
  loading: false,
  success : false
};

export const historyReducer = createSlice({
  name: "History",
  initialState,
  reducers: {
    fetchAllHistoryReducer: (state, action) => {
      // debugger
      if (action.payload.page === 1) {
        state.history = action.payload.data;
      } else {
        state.history = [...state.history, ...action.payload.data];
      }
      state.success = true;
    },
    fetchThreadReducer: (state, action) => {
      state.thread = action.payload.data;
    },
    clearThreadData: (state) => {
      state.thread = [];
    },
  },
});


export const {
    fetchAllHistoryReducer ,
    fetchThreadReducer,
    clearThreadData
} = historyReducer.actions;
export default historyReducer.reducer;
