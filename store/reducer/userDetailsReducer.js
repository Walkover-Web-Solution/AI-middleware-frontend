import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userDetails: {},
    organizations: [],
    loading: false,
    success: false
};

export const userDetailsReducer = createSlice({
    name: "user",
    initialState,
    reducers: {
        fetchUserDetails: (state, action) => {
            state.userDetails = action.payload;
            state.organizations = action.payload.c_companies;
            state.success = action.payload.success;
        },
        addOrganization: (state, action) => {
            state.organizations.push(action.payload);
        }
    },
});

export const { fetchUserDetails, addOrganization } = userDetailsReducer.actions;
export default userDetailsReducer.reducer;
