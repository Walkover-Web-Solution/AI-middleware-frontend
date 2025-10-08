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

            const index = state.PrebuiltPrompts.findIndex(item => item[action.payload.key] !== undefined);
            if (index !== -1) {
                state.PrebuiltPrompts[index][action.payload.key] = action.payload.value;
            } else {
                state.PrebuiltPrompts.push({ [action.payload.key]: action.payload.value });
            }
        }
    },
  });
  
  
  export const { getAllPrebuiltPrompts, updatePrebuiltPromptData   } = prebuiltPromptReducer.actions;
  
  export default prebuiltPromptReducer.reducer;
  