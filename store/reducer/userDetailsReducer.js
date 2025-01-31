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
    },
    updateUserDetails: (state, action) => {
      const { orgId, updatedUserDetails } = action.payload;
      state.organizations[orgId] = updatedUserDetails;
    }
  },
});

export const {
    fetchUserDetails,
    updateUserDetails
} = userDetailsReducer.actions;
export default userDetailsReducer.reducer;