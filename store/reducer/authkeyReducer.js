import { createSlice } from "@reduxjs/toolkit";

const initialState = {
 authData : [] ,
  loading: false
};

export const authDataReducer = createSlice({
  name: "authData",
  initialState,
  reducers: {
    fetchAllAuthData : (state, action) => {
       console.log(action.payload , "hello")
      state.authData = action.payload
    //   state.modelInfo = action.payload.modelInfo
    } ,
    createAuthData : (state, action) => {
        state.authData = [action.payload.data , ...state.authData]
    }
  },
});

export const {
    fetchAllAuthData , 
    createAuthData  
} = authDataReducer.actions;
export default authDataReducer.reducer;


