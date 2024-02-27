import { createSlice } from "@reduxjs/toolkit";

const initialState = {
 userDetails : {} ,
  loading: false,
  success : false
};

export const userDetailsReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUserDetails : (state, action) => {
      state.userDetails = action.payload.data[0] 
      state.success = action.payload.success
    } 
  },
});

export const {
    fetchUserDetails
} = userDetailsReducer.actions;
export default userDetailsReducer.reducer;