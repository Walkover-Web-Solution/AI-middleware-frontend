import { createSlice } from "@reduxjs/toolkit";

const initialState = {
 userDetails : {} ,
 organizations: [],
  loading: false,
  success : false
};

export const userDetailsReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUserDetails : (state, action) => {
      state.userDetails = action.payload 
      const org = {}
      action.payload.c_companies.forEach(element => {
        org[element.id] = element
      });
      state.organizations = org
      state.success = action.payload.success
    } 
  },
});

export const {
    fetchUserDetails
} = userDetailsReducer.actions;
export default userDetailsReducer.reducer;