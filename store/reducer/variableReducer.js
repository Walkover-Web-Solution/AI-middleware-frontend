import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  VariableMapping: {},
}

const variableReducer = createSlice({
  name: "Variable",
  initialState,
  reducers: {
    updateVariables: (state, action) => {
      const { data, bridgeId, versionId = "" } = action.payload;
      
      // Initialize bridgeId if it doesn't exist
      if (!state.VariableMapping[bridgeId]) {
        state.VariableMapping[bridgeId] = {};
      }
      
      if (versionId) {
        // Initialize versionId if it doesn't exist
        if (!state.VariableMapping[bridgeId][versionId]) {
          state.VariableMapping[bridgeId][versionId] = {};
        }
        state.VariableMapping[bridgeId][versionId].variables = data;
      } else {
        state.VariableMapping[bridgeId].variables = data;
      }
    },
  },
});

export const { updateVariables } = variableReducer.actions;
export default variableReducer.reducer;