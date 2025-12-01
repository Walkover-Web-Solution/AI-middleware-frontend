import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  history: [],
  versionHistory: [],
  thread: [],
  selectedVersion : 'all',
  loading: false,
  success: false,
  // Search slice
  search: {
    results: [],
    query: '',
    loading: false,
    hasMore: true,
    page: 1,
    isActive: false,
    dateRange: {
      start: null,
      end: null
    }
  }
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
    },
    clearSubThreadData: (state) => {
      state.subThreads = [];
    },
    setSelectedVersion: (state, action) => {
      state.selectedVersion = action.payload;
    },
    clearHistoryData: (state) => {
      state.history = [];
    },
    addThreadUsingRtLayer: (state, action) => {
      const {Thread} = action.payload;
      const threadIndex = state.history.findIndex((thread) => thread.thread_id === Thread.thread_id);
      if (threadIndex !== -1) {
        state.history.splice(threadIndex, 1);
        state.history.unshift(Thread);
      } else {
        state.history.unshift(Thread);
      }
    },
    addThreadNMessageUsingRtLayer: (state, action) => {
      const {thread_id, sub_thread_id, Messages} = action.payload;
      const threadIndex = state.thread.findIndex((thread) => thread.thread_id === thread_id && thread.sub_thread_id === sub_thread_id);
      if (threadIndex !== -1) {
          state.thread.push(Messages);
      } 
    },
    
    // Search reducers
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
      state.search.isActive = action.payload.length > 0;
      if (!action.payload) {
        state.search.results = [];
        state.search.page = 1;
        state.search.hasMore = true;
      }
    },
    setSearchLoading: (state, action) => {
      state.search.loading = action.payload;
    },
    setSearchResults: (state, action) => {
      const { data, page = 1 } = action.payload;
      if (page === 1) {
        state.search.results = data || [];
      } else {
        state.search.results = [...state.search.results, ...(data || [])];
      }
      state.search.page = page;
      state.search.loading = false;
    },
    appendSearchResults: (state, action) => {
      const { data } = action.payload;
      state.search.results = [...state.search.results, ...(data || [])];
      state.search.page += 1;
      state.search.loading = false;
    },
    setSearchHasMore: (state, action) => {
      state.search.hasMore = action.payload;
    },
    clearSearchResults: (state) => {
      state.search.results = [];
      state.search.query = '';
      state.search.isActive = false;
      state.search.page = 1;
      state.search.hasMore = true;
      state.search.loading = false;
    },
    setSearchDateRange: (state, action) => {
      const { start, end } = action.payload;
      state.search.dateRange.start = start;
      state.search.dateRange.end = end;
    },
    clearSearchDateRange: (state) => {
      state.search.dateRange.start = null;
      state.search.dateRange.end = null;
    },
  },
});


export const {
  fetchAllHistoryReducer,
  fetchThreadReducer,
  clearThreadData,
  updateHistoryMessageReducer,
  userFeedbackCountReducer,
  fetchSubThreadReducer,
  clearSubThreadData,
  setSelectedVersion,
  clearHistoryData,
  addThreadUsingRtLayer,
  addThreadNMessageUsingRtLayer,
  // Search actions
  setSearchQuery,
  setSearchLoading,
  setSearchResults,
  appendSearchResults,
  setSearchHasMore,
  clearSearchResults,
  setSearchDateRange,
  clearSearchDateRange
} = historyReducer.actions;
export default historyReducer.reducer;
