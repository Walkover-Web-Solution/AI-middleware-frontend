import { createSlice } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

const initialState = {
 authData : [] ,
  loading: false
};

export const authDataReducer = createSlice({
  name: "authData",
  initialState,
  reducers: {
    fetchAllAuthData : (state, action) => {
      state.authData = action.payload
    //   state.modelInfo = action.payload.modelInfo
    } ,
    addAuthData : (state, action) => {
        state.authData = [action.payload.data , ...state.authData]
    },
    removeAuthData : (state , action) => {
      const cloneData =  cloneDeep(state.authData)
      cloneData.splice(cloneData[action.payload] , 1)
      state.authData = [...cloneData]
    }
  },
});

export const {
    fetchAllAuthData , 
    addAuthData, 
    removeAuthData
} = authDataReducer.actions;
export default authDataReducer.reducer;


