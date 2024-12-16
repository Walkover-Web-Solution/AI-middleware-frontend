import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  history: [],
  thread: [],
  loading: false,
  success: false
};

export const historyReducer = createSlice({
  name: "History",
  initialState,
  reducers: {
    fetchAllHistoryReducer: (state, action) => {
      if (action.payload.page === 1) {
        state.history = action.payload.data;
      } else {
        state.history = [...state.history, ...action.payload.data];
      }
      state.success = true;
    },
    fetchThreadReducer: (state, action) => {
      if (action.payload.nextPage == 1) { 
        state.thread = action.payload.data.data; 
      }
      else {
        state.thread = [...action.payload.data.data, ...state.thread];
      }
    },
    
    clearThreadData: (state) => {
      state.thread = [];
    },
    updateHistoryMessageReducer: (state, action) => {
      const { index, data } = action.payload
      state.thread[index] = {...state.thread[index], ...data};
    },
    userFeedbackCountReducer:(state,action) =>{
      const {data} = action.payload;
      state.userFeedbackCount = data;
    },
    fetchSubThreadReducer: (state,action) =>{
      const {data} = action.payload;
      state.subThreads = data;
    }
  },
});


export const {
  fetchAllHistoryReducer,
  fetchThreadReducer,
  clearThreadData,
  updateHistoryMessageReducer,
  userFeedbackCountReducer,
  fetchSubThreadReducer
} = historyReducer.actions;
export default historyReducer.reducer;
