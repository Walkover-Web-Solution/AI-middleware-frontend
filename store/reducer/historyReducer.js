import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  history: [],
  versionHistory: [],
  thread: [],
  selectedVersion : 'all',
  loading: false,
  success: false,
  // Search state
  searchResults: [],
  searchQuery: "",
  isSearchActive: false,
  searchLoading: false,
  hasMoreSearchResults: false,
  searchPage: 1,
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
        Messages.map((message) => {
          state.thread.push(message);
        })
      } 
    },
    // Search reducers
    setSearchResults: (state, action) => {
      const { data, page = 1, hasMore = false } = action.payload;
      if (page === 1) {
        state.searchResults = data || [];
      } else {
        state.searchResults = [...state.searchResults, ...(data || [])];
      }
      state.hasMoreSearchResults = hasMore;
      state.searchPage = page;
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.isSearchActive = action.payload && action.payload.trim().length > 0;
    },
    
    setSearchLoading: (state, action) => {
      state.searchLoading = action.payload;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.isSearchActive = false;
      state.searchLoading = false;
      state.hasMoreSearchResults = false;
      state.searchPage = 1;
    },
    
    appendSearchResults: (state, action) => {
      const { data } = action.payload;
      state.searchResults = [...state.searchResults, ...(data || [])];
      state.searchPage += 1;
    },
    
    setSearchPage: (state, action) => {
      state.searchPage = action.payload;
    },
    
    setHasMoreSearchResults: (state, action) => {
      state.hasMoreSearchResults = action.payload;
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
  setSearchResults,
  setSearchQuery,
  setSearchLoading,
  clearSearchResults,
  appendSearchResults,
  setSearchPage,
  setHasMoreSearchResults
} = historyReducer.actions;
export default historyReducer.reducer;
