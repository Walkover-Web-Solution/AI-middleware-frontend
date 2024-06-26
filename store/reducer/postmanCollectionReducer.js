import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  postmanCollection: [],
  loading: false,
  error: null
};

const postmanCollectionReducer = createSlice({
  name: 'postmanCollection',
  initialState,
  reducers: {
    postmanCollectionFetched: (state, action) => {
      state.postmanCollection = action.payload.data;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { postmanCollectionFetched, setLoading, setError } = postmanCollectionReducer.actions;

export default postmanCollectionReducer.reducer;
