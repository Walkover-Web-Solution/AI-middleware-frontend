import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  PrebuiltPrompts: [],
  loading: false,
  error: null,
};

const prebuiltPromptReducer = createSlice({
    name: 'prebuiltPrompt',
    initialState,
    reducers: {
        getAllPrebuiltPrompts: (state, action) => {
            state.PrebuiltPrompts = action.payload;
        },
        updatePrebuiltPromptData: (state, action) => {
            state.PrebuiltPrompts = { ...state.PrebuiltPrompts, [action.payload.key]: action.payload.value };
        },
    },
  });
  
  
  export const { getAllPrebuiltPrompts, updatePrebuiltPromptData   } = prebuiltPromptReducer.actions;
  
  export default prebuiltPromptReducer.reducer;
  