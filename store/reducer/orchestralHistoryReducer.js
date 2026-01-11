import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  historyData: [],
  threadData: [],
  selectedThread: null,
  selectedFlowData: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  filterOption: 'all',
  searchTerm: '',
  activeTab: 'history',
  showVisualization: false,
  currentStep: 0,
  isPlaying: false,
  animationSpeed: 2000
};

const orchestralHistorySlice = createSlice({
  name: 'orchestralHistory',
  initialState,
  reducers: {
    setHistoryData: (state, action) => {
      state.historyData = action.payload;
    },
    setThreadData: (state, action) => {
      state.threadData = action.payload;
    },
    setSelectedThread: (state, action) => {
      state.selectedThread = action.payload;
    },
    setSelectedFlowData: (state, action) => {
      state.selectedFlowData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setFilterOption: (state, action) => {
      state.filterOption = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setShowVisualization: (state, action) => {
      state.showVisualization = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setAnimationSpeed: (state, action) => {
      state.animationSpeed = action.payload;
    },
    addHistoryData: (state, action) => {
      state.historyData = [...state.historyData, ...action.payload];
    },
    addThreadData: (state, action) => {
      state.threadData = [...state.threadData, ...action.payload];
    },
    resetVisualization: (state) => {
      state.currentStep = 0;
      state.isPlaying = false;
      state.showVisualization = false;
    },
    resetState: (state) => {
      return initialState;
    }
  }
});

export const {
  setHistoryData,
  setThreadData,
  setSelectedThread,
  setSelectedFlowData,
  setLoading,
  setError,
  setPage,
  setHasMore,
  setFilterOption,
  setSearchTerm,
  setActiveTab,
  setShowVisualization,
  setCurrentStep,
  setIsPlaying,
  setAnimationSpeed,
  addHistoryData,
  addThreadData,
  resetVisualization,
  resetState
} = orchestralHistorySlice.actions;

export default orchestralHistorySlice.reducer;
