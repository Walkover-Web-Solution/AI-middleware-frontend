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
    },
  updateOnBoarding: (state, action) => {
  const { updatedOnboarding, orgId } = action.payload;

  if (state.userDetails?.c_companies) {
    const targetCompany = state.userDetails.c_companies.find(
      (c) => c.id === Number(orgId)
    );

    if (targetCompany?.meta) {
      targetCompany.meta.onboarding = updatedOnboarding;
    }
  }
}


,
    updateToken: (state, action) => {
      const { auth_token, orgId } = action.payload;
      state.organizations[orgId] = {
        ...state.organizations[orgId],
        meta: {
          ...state.organizations[orgId]?.meta,
          auth_token: auth_token
        }
      }
    }
  },
});

export const {
  fetchUserDetails,
  updateUserDetails,
  updateToken,
  updateOnBoarding
} = userDetailsReducer.actions;
export default userDetailsReducer.reducer;